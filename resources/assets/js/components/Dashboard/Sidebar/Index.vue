<template>
  <div class="sidebar bg-blue-darkest py-8 overflow-y-scroll px-4">
    <sidebar-header title="Stars">
      <refresh-button
        :active="refreshingStars"
        @click.native="refreshStars"/>
    </sidebar-header>
    <ul class="dashboard-list sidebar-stars list-none m-0 p-0 pb-3">
      <sidebar-item
        :class="{ 'selected': noFiltersApplied }"
        class="all-stars"
        title="All Stars"
        icon="InboxIcon"
        icon-size="16"
        @click.native="resetFilters"
      />
      <sidebar-item
        :class="{ 'selected': viewingUntagged }"
        class="untagged-stars"
        title="Untagged Stars"
        icon="StarIcon"
        icon-size="16"
        @click.native="setViewingUntagged(true)"
      />
    </ul>
    <sidebar-header title="Tags">
      <tag-sorter/>
    </sidebar-header>
    <new-tag-form @submit="doAddTag"/>
    <ul
      ref="sidebarTags"
      class="dashboard-list sidebar-tags list-none m-0 p-0 pb-3">
      <sidebar-tag
        v-for="tag in tags"
        :tag="tag"
        :key="tag.id"
        :is-selected="currentTag.id == tag.id"
        :data-id="tag.id"
        @click.native="doSetCurrentTag(tag, $event)"
        @starsDropped="tagStarWithData"
        @deleteTag="doDeleteTag"
        @renameTag="renameTag"
      />
    </ul>
    <sidebar-header title="Languages"/>
    <ul class="dashboard-list sidebar-languages list-none m-0 p-0 pb-3">
      <sidebar-item
        v-for="(value, key) in languages"
        :key="key"
        :badge="value"
        :title="key"
        :class="{ 'selected': currentLanguage == key }"
        class="language rounded"
        @click.native="setCurrentLanguage(key)"
      />
    </ul>
  </div>
</template>
<script>
import NewTagForm from '@/components/Dashboard/Sidebar/NewTagForm'
import RefreshButton from '@/components/Dashboard/Sidebar/RefreshButton'
import SidebarHeader from '@/components/Dashboard/Sidebar/SidebarHeader'
import SidebarItem from '@/components/Dashboard/Sidebar/SidebarItem'
import SidebarTag from '@/components/Dashboard/Sidebar/SidebarTag'
import TagSorter from '@/components/Dashboard/Sidebar/TagSorter'
import { mapActions, mapGetters } from 'vuex'
import dragula from 'dragula'
export default {
  name: 'Sidebar',
  components: {
    NewTagForm,
    RefreshButton,
    SidebarHeader,
    SidebarItem,
    SidebarTag,
    TagSorter
  },
  data () {
    return {
      refreshingStars: false,
      drake: null
    }
  },
  computed: {
    ...mapGetters([
      'tags',
      'currentTag',
      'languages',
      'currentLanguage',
      'viewingUntagged',
      'pageInfo'
    ]),
    noFiltersApplied () {
      return (
        !Object.keys(this.currentTag).length &&
        this.currentLanguage === '' &&
        !this.viewingUntagged
      )
    }
  },
  async mounted () {
    this.$bus.$on('TAGS_SORTED', method => {
      this.sortTags(method)
    })

    this.drake = dragula([this.$refs.sidebarTags]).on(
      'drop',
      (el, target, source, sibling) => {
        let sortMap = Array.from(source.children).map((el, i) => {
          return {
            id: el.dataset.id,
            sort_order: i
          }
        })
        this.reorderTags(sortMap)
      }
    )

    await this.fetchTags()

    if (this.$route.query.tag) {
      const queryTag = this.tags.find(tag => {
        return tag.name === this.$route.query.tag
      })
      if (queryTag) {
        this.setCurrentTag(queryTag)
      }
    }

    if (this.$route.query.language) {
      this.setCurrentLanguage(this.$route.query.language)
    }
  },
  methods: {
    ...mapActions([
      'addTag',
      'fetchTags',
      'setCurrentTag',
      'setCurrentLanguage',
      'setViewingUntagged',
      'addTagToStars',
      'reorderTags',
      'sortTags',
      'deleteTag',
      'renameTag',
      'fetchGitHubStars',
      'cleanupStars'
    ]),
    async refreshStars () {
      this.refreshingStars = true
      await this.fetchGitHubStars({ cursor: false, refresh: true })
      while (this.pageInfo.hasNextPage) {
        await this.fetchGitHubStars({
          cursor: this.pageInfo.endCursor,
          refresh: false
        })
      }
      await this.cleanupStars()
      this.refreshingStars = false
    },
    doAddTag (name) {
      this.addTag(name)
    },
    doDeleteTag (id) {
      // TODO: Ask user to confirm
      this.deleteTag(id)
    },
    doSetCurrentTag (tag, e) {
      if (e.target.classList.contains('dashboard-list-item')) {
        this.setCurrentTag(tag)
      }
    },
    resetFilters () {
      this.setViewingUntagged(false)
      this.setCurrentTag({})
      this.setCurrentLanguage('')
    },
    tagStarWithData ({ data, id }) {
      const tag = this.tags.find(tag => tag.id === parseInt(id, 10))
      if (Array.isArray(data)) {
        this.addTagToStars({stars: data, tag})
      } else {
        this.addTagToStars({stars: [data], tag})
      }
    }
  }
}
</script>
<style lang="scss">
.gu-mirror {
  position: fixed !important;
  margin: 0 !important;
  z-index: 9999 !important;
  opacity: 0.8;
  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=80)';
  filter: alpha(opacity=80);
}
.gu-hide {
  display: none !important;
}
.gu-unselectable {
  user-select: none !important;
}
.gu-transit {
  opacity: 0.2;
  -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=20)';
  filter: alpha(opacity=20);
}
</style>
