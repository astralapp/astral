<template>
  <div class="dashboard-sidebar">
    <div class="dashboard-sidebar-header">
      <img src="/images/logo.svg" alt="Astral">
    </div>
    <div class="sidebar-header">
      <h3 class="sidebar-header-text">Stars</h3>
    </div>
    <ul class="dashboard-list sidebar-stars">
      <li class="all-stars dashboard-list-item" @click="resetTag" :class="{ 'selected': noCurrentTag && !viewingUntagged }"><i class="fa fa-inbox"></i> All Stars</li>
      <li class="untagged-stars dashboard-list-item" @click="showUntagged" :class="{ 'selected': viewingUntagged }"><i class="fa fa-star-o"></i> Untagged Stars</li>
    </ul>
    <div class="sidebar-header tags-header">
      <h3 class="sidebar-header-text">Tags</h3>
      <div class="tag-button-group">
        <button class="tag-button-group-item" @click="addTagFormShowing = !addTagFormShowing">Add</button>
        <button class="tag-button-group-item">Edit</button>
        <button class="tag-button-group-item">Sort</button>
      </div>
    </div>
    <form class="tag-form" v-show="addTagFormShowing" @submit.prevent="doAddTag()">
      <input type="text" name="name" v-model="newTag.name" placeholder="Tag name">
      <button type="submit">Save</button>
    </form>
    <ul class="dashboard-list sidebar-tags" v-sortable="tags" sort="reorderTags">
      <li class="dashboard-list-item tag" v-for="tag in tags" track-by="id" v-dropzone="tagStarWithData" :data-id="tag.id" @click="setTag(tag)" :class="{ 'selected': currentTag.id == tag.id }">
        <i class="fa fa-tag"></i>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tagged-count" v-if="tag.stars_count > 0">{{ tag.stars_count }}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import { newTag, tags, currentTag } from "../store/getters/tagsGetters"
import {
  fetchTags,
  addTag,
  tagStar,
  reorderTags,
  setCurrentTag
} from "../store/actions"
import "./../directives/drag_and_drop.js"

export default {
  name: "DashboardSidebar",
  vuex: {
    getters: {
      newTag,
      tags,
      currentTag
    },
    actions: {
      fetchTags,
      addTag,
      tagStar,
      reorderTags,
      setCurrentTag
    }
  },
  data () {
    return {
      addTagFormShowing: false,
      viewingUntagged: false
    }
  },
  computed: {
    noCurrentTag () {
      return !Object.keys(this.currentTag).length
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
        this.$root.$broadcast("NOTIFICATION", "There was an error creating this tag.", "error")
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
    }
  },
  events: {
    "IS_VIEWING_UNTAGGED": function (isViewing) {
      this.viewingUntagged = isViewing
    }
  }
}
</script>
