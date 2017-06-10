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
          <sort-tags-dropdown :visible="sortTagsDropdownVisible" v-on-clickaway="hideSortTagsDropdown"></sort-tags-dropdown>
        </div>
      </div>
    </div>
    <form class="tag-form" v-show="addTagFormShowing" @submit.prevent="doAddTag()">
      <input type="text" name="name" v-model="newTag.name" placeholder="Tag name">
      <button type="submit">Save</button>
    </form>
    <!-- <div class="no-tags" v-show="tags.length == 0">
      <i class="fa fa-tag"></i>
      <p>You haven't added any tags yet!</p>
    </div> -->
    <transition-group name="sidebar-tag" tag="ul" class="dashboard-list sidebar-tags">
      <li class="dashboard-list-item tag" v-for="tag in tags" :key="tag.id" :data-id="tag.id" @click="setTag(tag)" :class="{ 'selected': currentTag.id == tag.id }" ref="tag">
        <i class="fa fa-tag"></i>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tagged-count" v-if="tag.stars_count > 0">{{ tag.stars_count }}</span>
      </li>
    </transition-group>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { orderBy } from 'lodash'
import { mixin as clickaway } from 'vue-clickaway'
import $ from 'jquery'
import dragula from 'dragula'
import SortTagsDropdown from './sort-tags-dropdown.vue'

export default {
  name: 'DashboardSidebar',
  components: {
    'sort-tags-dropdown': SortTagsDropdown
  },
  mixins: [clickaway],
  data () {
    return {
      addTagFormShowing: false,
      sortTagsDropdownVisible: false,
      refreshingStars: false,
      drake: null
    }
  },
  computed: {
    ...mapGetters([
      'newTag',
      'tags',
      'currentTag',
      'tagFilter',
      'githubStars'
    ])
  },
  watch: {
    tags () {
      setTimeout(() => {
        this.bindTagItemDragListeners()
      }, 1)
    }
  },
  created () {
    this.fetchTags().then(() => {
      if (this.$route.params.tag) {
        const tag = this.tags.find((tag) => {
          return tag.slug === this.$route.params.tag
        })
        if (tag) {
          this.setCurrentTag(tag)
        }
      }
      let sortMap = []
      this.drake = dragula([document.querySelector('.sidebar-tags')]).on('drop', (el, target, source, sibling) => {
        sortMap = Array.from(source.children).map(function (el, index) {
          return {
            id: el.dataset.id,
            sortOrder: index
          }
        })
        this.reorderTags(sortMap)
      })
    }).catch((errors) => {
      this.$bus.$emit('NOTIFICATION', 'There was an error fetching your tags.', 'error')
    })

    this.$bus.$on('TAGS_SORTED', (sorter) => {
      this.sortTagsDropdownVisible = false
      let sortedTags = []
      let sortMap = []
      switch (sorter) {
        case 'ALPHA_ASC':
          sortedTags = orderBy(this.tags, ['name'], ['asc'])
          break
        case 'ALPHA_DESC':
          sortedTags = orderBy(this.tags, ['name'], ['desc'])
          break
        case 'STARS_ASC':
          sortedTags = orderBy(this.tags, ['stars_count'], ['asc'])
          break
        case 'STARS_DESC':
          sortedTags = orderBy(this.tags, ['stars_count'], ['desc'])
          break
        default:
          sortedTags = orderBy(this.tags, ['name'], ['asc'])
          break
      }
      sortMap = sortedTags.map((tag, index) => {
        return {
          id: tag.id,
          sortOrder: index
        }
      })
      this.reorderTags(sortMap)
    })
  },
  destroyed () {
    if (this.drake) {
      this.drake.destroy()
    }
  },
  methods: {
    ...mapActions([
      'fetchTags',
      'fetchStars',
      'addTag',
      'tagStar',
      'reorderTags',
      'setCurrentTag',
      'cleanupStars'
    ]),
    bindTagItemDragListeners () {
      $('.dashboard-list-item.tag').off('dragover dragleave drop')
      $('.dashboard-list-item.tag').on('dragover', function (e) {
        e.preventDefault()
        e.stopPropagation()
        e.target.classList.add('dragging')
      })
      $('.dashboard-list-item.tag').on('dragleave', function (e) {
        e.preventDefault()
        e.stopPropagation()
        e.target.classList.remove('dragging')
      })
      $('.dashboard-list-item.tag').on('drop', (e) => {
        const dropData = JSON.parse(e.originalEvent.dataTransfer.getData('text'))
        const tagId = e.currentTarget.dataset.id
        e.preventDefault()
        e.stopPropagation()
        e.target.classList.remove('dragging')
        this.tagStarWithData(dropData, tagId)
      })
    },
    doAddTag: function () {
      const newTagName = this.newTag.name
      this.addTag().then(() => {
        this.$bus.$emit('NOTIFICATION', `${newTagName} was created successfully.`)
      }).catch((errors) => {
        if (errors.name) {
          this.$bus.$emit('NOTIFICATION', errors.name[0], 'error')
        } else {
          this.$bus.$emit('NOTIFICATION', 'There was an error creating this tag.', 'error')
        }
      })
    },
    tagStarWithData: function (data, tagId) {
      const starData = {
        repoId: data.id,
        repoName: data.full_name,
        tagId
      }
      this.tagStar(starData)
    },
    setTag: function (tag) {
      this.$router.push(`/dashboard/tag/${tag.slug}`)
    },
    resetTag: function () {
      this.$router.push('/dashboard')
    },
    viewingUntagged () {
      return this.$route.fullPath.match(/^\/dashboard\/untagged/g) !== null
    },
    showUntagged () {
      this.$router.push('/dashboard/untagged')
    },
    refreshStars () {
      this.$bus.$emit('STATUS', 'Loading stars...')
      this.refreshingStars = true
      this.fetchStars({ refresh: true }).then((res) => {
        this.refreshingStars = false
        this.$bus.$emit('STATUS', 'Cleaning up...')
        this.cleanupStars().then((res) => {
          this.$bus.$emit('STATUS', '')
        })
        Array.from(document.querySelectorAll('.repo')).forEach((repo) => {
          repo.addEventListener('dragstart', (e) => {
            const data = JSON.stringify(this.githubStars[parseInt(e.currentTarget.dataset.index, 10)])
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', data)
          }, false)
        })
      }).catch((error) => {
        error = JSON.parse(error)
        this.refreshingStars = false
        this.$bus.$emit('STATUS', '')
        // Check if user is throttled
        if (error.response.status === 429) {
          const secondsRemaining = parseInt(error.headers['retry-after'], 10)
          const time = secondsRemaining >= 60 ? `${Math.round(secondsRemaining / 60)} minute(s)` : `${secondsRemaining} second(s)`

          this.$bus.$emit('NOTIFICATION', `You can only refresh your stars from GitHub once every 5 minutes. Please wait ${time}, and try again.`, 'error', 7000)
        } else {
          this.$bus.$emit('NOTIFICATION', 'There was an error fetching your stars from GitHub.', 'error')
        }
      })
    },
    hideSortTagsDropdown () {
      this.sortTagsDropdownVisible = false
    }
  }
}
</script>
