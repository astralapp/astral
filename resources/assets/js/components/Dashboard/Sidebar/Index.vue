<template>
  <div class="sidebar bg-blue-darkest py-8 overflow-y-scroll px-4">
    <sidebar-header title="Stars">
      <refresh-button :active="refreshingStars" @click.native="refreshStars"></refresh-button>
    </sidebar-header>
    <ul class="dashboard-list sidebar-stars list-none m-0 p-0 border-b border-black pb-3">
      <sidebar-item 
        :class="{ 'selected': noFiltersApplied }"
        class="all-stars" 
        title="All Stars" 
        icon="InboxIcon" 
        icon-size="16" 
        @click.native="resetFilters"
      >
      </sidebar-item>
      <sidebar-item 
        class="untagged-stars" 
        :class="{ 'selected': viewingUntagged }"
        title="Untagged Stars" 
        icon="StarIcon" 
        icon-size="16" 
        @click.native="setViewingUntagged(true)"
        >
        </sidebar-item>
    </ul>
    <sidebar-header title="Tags">
      <sort-tags></sort-tags>
    </sidebar-header>
    <new-tag-form @submit="doAddTag"></new-tag-form>
    <ul class="dashboard-list sidebar-tags list-none m-0 p-0 border-b border-black pb-3" ref="sidebarTags">
      <sidebar-item 
        v-for="tag in tags"
        :tag="tag"
        :key="tag.id" 
        :data-id="tag.id" 
        :badge="tag.stars_count"
        :title="tag.name" 
        class="tag rounded" 
        ref="tag" 
        icon="TagIcon" 
        icon-size="14" 
        :class="{ 'selected': currentTag.id == tag.id }"
        :star-target="true"
        @starDropped="tagStarWithData"
        @deleteTag="doDeleteTag"
        @renameTag="renameTag"
        @click.native="setCurrentTag(tag)"
        >
        </sidebar-item>
    </ul>
    <sidebar-header title="Languages"></sidebar-header>
    <ul class="dashboard-list sidebar-languages list-none m-0 p-0 border-b border-black pb-3">
      <sidebar-item 
        v-for="(value, key) in languages" 
        :key="key" 
        :badge="value"
        :title="key" 
        class="language rounded"
        :class="{ 'selected': currentLanguage == key }"
        @click.native="setCurrentLanguage(key)" 
        >
        </sidebar-item>
    </ul>
  </div>
</template>
<script>
import NewTagForm from '@/components/Dashboard/Sidebar/NewTagForm'
import RefreshButton from '@/components/Dashboard/Sidebar/RefreshButton'
import SidebarHeader from '@/components/Dashboard/Sidebar/SidebarHeader'
import SidebarItem from '@/components/Dashboard/Sidebar/SidebarItem'
import SortTags from '@/components/Dashboard/Sidebar/SortTags'
import { mapActions, mapGetters } from 'vuex'
import dragula from 'dragula'
export default {
  name: 'Sidebar',
  components: {
    NewTagForm,
    RefreshButton,
    SidebarHeader,
    SidebarItem,
    SortTags
  },
  data() {
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
    noFiltersApplied() {
      return (
        !Object.keys(this.currentTag).length &&
        this.currentLanguage === '' &&
        !this.viewingUntagged
      )
    }
  },
  mounted() {
    this.fetchTags()

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
  },
  methods: {
    ...mapActions([
      'addTag',
      'fetchTags',
      'setCurrentTag',
      'setCurrentLanguage',
      'setViewingUntagged',
      'pushStarTag',
      'reorderTags',
      'sortTags',
      'deleteTag',
      'renameTag',
      'fetchGitHubStars',
      'cleanupStars'
    ]),
    async refreshStars() {
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
    doAddTag(name) {
      this.addTag(name)
    },
    doDeleteTag(id) {
      //TODO: Ask user to confirm
      this.deleteTag(id)
    },
    resetFilters() {
      this.setViewingUntagged(false)
      this.setCurrentTag({})
      this.setCurrentLanguage('')
    },
    tagStarWithData({ data, id }) {
      const tag = this.tags.find(tag => tag.id === parseInt(id, 10))
      this.pushStarTag({ starId: data.id, tag: tag })
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
