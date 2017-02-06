<template>
  <div class="dashboard-sidebar">
    <div class="dashboard-sidebar-header">
      <img src="/images/logo.svg" alt="Astral">
    </div>
    <div class="sidebar-header">
      <h3 class="sidebar-header-text">Stars</h3>
      <div class="sidebar-header-control">
        <button class="refresh-stars" :class="{ 'active': refreshingStars }" @click="refreshStars"><i class="fa fa-refresh"></i></button>
      </div>
    </div>
    <ul class="dashboard-list sidebar-stars">
      <li class="all-stars dashboard-list-item" @click="resetTag" :class="{ 'selected': tagFilter == 'ALL' }"><i class="fa fa-inbox"></i> All Stars</li>
      <li class="untagged-stars dashboard-list-item" @click="showUntagged" :class="{ 'selected': tagFilter == 'UNTAGGED' }"><i class="fa fa-star-o"></i> Untagged Stars</li>
    </ul>
    <div class="sidebar-header tags-header">
      <h3 class="sidebar-header-text">Tags</h3>
      <div class="tag-button-group">
        <button class="tag-button-group-item" @click="addTagFormShowing = !addTagFormShowing"><i class="fa fa-plus-circle"></i> Add</button>
        <div class="sidebar-sortDropdown">
          <button class="tag-button-group-item" @click.stop="sortTagsDropdownVisible = !sortTagsDropdownVisible"><i class="fa fa-sort"></i> Sort</button>
          <sort-tags-dropdown :visible="sortTagsDropdownVisible" v-on-clickaway="sortTagsDropdownVisible = false"></sort-tags-dropdown>
        </div>
      </div>
    </div>
    <form class="tag-form" v-show="addTagFormShowing" @submit.prevent="doAddTag()">
      <input type="text" name="name" v-model="newTag.name" placeholder="Tag name">
      <button type="submit">Save</button>
    </form>
    <ul class="dashboard-list sidebar-tags" v-sortable="tags" sort="reorderTags">
      <!-- <div class="no-tags" v-show="tags.length == 0">
        <i class="fa fa-tag"></i>
        <p>You haven't added any tags yet!</p>
      </div> -->
      <li class="dashboard-list-item tag" v-for="tag in tags" track-by="id" v-dropzone="tagStarWithData" :data-id="tag.id" @click="setTag(tag)" :class="{ 'selected': currentTag.id == tag.id }" transition="tag">
        <i class="fa fa-tag"></i>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tagged-count" v-if="tag.stars_count > 0">{{ tag.stars_count }}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import Vue from "vue"
import VueAnimatedList from "vue-animated-list"
import { newTag, tags, currentTag, tagFilter } from "../store/getters/tagsGetters"
import {
  fetchTags,
  fetchGithubStars,
  addTag,
  tagStar,
  reorderTags,
  setCurrentTag
} from "../store/actions"
import "./../directives/drag_and_drop.js"
import { orderBy } from "lodash"
import { mixin as clickaway } from "vue-clickaway"
import SortTagsDropdown from "./sort-tags-dropdown.vue"

Vue.use(VueAnimatedList)

export default {
  name: "DashboardSidebar",
  components: {
    "sort-tags-dropdown": SortTagsDropdown
  },
  mixins: [clickaway],
  vuex: {
    getters: {
      newTag,
      tags,
      currentTag,
      tagFilter
    },
    actions: {
      fetchTags,
      fetchGithubStars,
      addTag,
      tagStar,
      reorderTags,
      setCurrentTag
    }
  },
  data () {
    return {
      addTagFormShowing: false,
      sortTagsDropdownVisible: false,
      refreshingStars: false,
    }
  },
  ready () {
    this.fetchTags().then(() => {
      if (this.$route.params.tag) {
        const tag = this.tags.find((tag) => {
          return tag.slug === this.$route.params.tag
        })
        if (tag) {
          this.setCurrentTag(tag)
        }
      }
    }).catch((errors) => {
      this.$root.$broadcast("NOTIFICATION", "There was an error fetching your tags.", "error")
    })
  },
  methods: {
    doAddTag: function () {
      const newTagName = this.newTag.name
      this.addTag().then(() => {
        this.$root.$broadcast("NOTIFICATION", `${newTagName} was created successfully.`)
      }).catch((errors) => {
        if (errors.name){
          this.$root.$broadcast("NOTIFICATION", errors.name[0], "error")
        } else {
          this.$root.$broadcast("NOTIFICATION", "There was an error creating this tag.", "error")
        }
      })
    },
    tagStarWithData: function (data, scope) {
      const starData = {
        repoId: data.id,
        repoName: data.full_name,
        tagId: scope.tag.id
      }
      this.tagStar(starData)
    },
    setTag: function (tag) {
      this.$route.router.go(`/dashboard/tag/${tag.slug}`)
    },
    resetTag: function () {
      this.$route.router.go("/dashboard")
    },
    viewingUntagged () {
      return window.location.pathname.match(/^\/dashboard\/untagged/g) !== null
    },
    showUntagged () {
      this.$route.router.go("/dashboard/untagged")
    },
    refreshStars () {
      this.$root.$broadcast("STATUS", "Loading stars...")
      this.refreshingStars = true
      this.fetchGithubStars(1, 1, true).then((res) => {
        this.refreshingStars = false
        this.$root.$broadcast("STATUS", "")
      }).catch((error) => {
        error = JSON.parse(error)
        this.refreshingStars = false
        this.$root.$broadcast("STATUS", "")
        // Check if user is throttled
        if (error.response.status === 429) {
          const secondsRemaining = parseInt(error.headers["retry-after"], 10)
          const time = secondsRemaining >= 60 ? `${Math.round(secondsRemaining / 60)} minute(s)` : `${secondsRemaining} second(s)`

          this.$root.$broadcast("NOTIFICATION", `You can only refresh your stars from GitHub once every 5 minutes. Please wait ${time}, and try again.`, "error", 7000)
        } else {
          this.$root.$broadcast("NOTIFICATION", "There was an error fetching your stars from GitHub.", "error")
        }
      })
    }
  },
  events: {
    "TAGS_SORTED": function (sorter) {
      this.sortTagsDropdownVisible = false
      let sortedTags = []
      let sortMap = []
      switch (sorter) {
        case "ALPHA_ASC":
          sortedTags = orderBy(this.tags, ["name"], ["asc"])
          break
        case "ALPHA_DESC":
          sortedTags = orderBy(this.tags, ["name"], ["desc"])
          break
        case "STARS_ASC":
          sortedTags = orderBy(this.tags, ["stars_count"], ["asc"])
          break
        case "STARS_DESC":
          sortedTags = orderBy(this.tags, ["stars_count"], ["desc"])
          break
        default:
          sortedTags = orderBy(this.tags, ["name"], ["asc"])
          break
      }
      sortMap = sortedTags.map((tag, index) => {
        return {
          id: tag.id,
          sort_order: index
        }
      })
      this.reorderTags(sortMap)
    }
  }
}
</script>
