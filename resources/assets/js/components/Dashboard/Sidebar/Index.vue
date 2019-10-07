<template>
  <div class="sidebar bg-blue-darkest py-8 overflow-y-scroll px-4">
    <SidebarHeader title="Stars">
      <RefreshButton :active="refreshingStars" @click.native="refreshStars" />
    </SidebarHeader>
    <ul class="dashboard-list sidebar-stars list-none m-0 p-0 pb-3">
      <SidebarItem
        :class="{ selected: noFiltersApplied }"
        :badge="totalStars"
        class="all-stars"
        title="All Stars"
        icon="InboxIcon"
        icon-size="16"
        @click.native="resetFilters"
      />
      <SidebarItem
        :class="{ selected: viewingUntagged }"
        :badge="totalUntaggedStars"
        class="untagged-stars"
        title="Untagged Stars"
        icon="StarIcon"
        icon-size="16"
        @click.native="setViewingUntagged(true)"
      />
    </ul>
    <SidebarGroup :collapsible="true" :is-collapsed="tagsCollapsed" @toggle="toggleCollapsedState('tags')">
      <template v-slot:header="{ toggleCollapsed }">
        <SidebarHeader title="Tags" @click.native.stop="toggleCollapsed">
          <TagSorter />
        </SidebarHeader>
      </template>
      <template v-slot:content="{ isCollapsed }">
        <div v-show="!isCollapsed">
          <NewTagForm @submit="doAddTag" />
          <ul ref="sidebarTags" class="dashboard-list sidebar-tags list-none m-0 p-0 pb-3">
            <SidebarTag
              v-for="tag in tags"
              :key="tag.id"
              :tag="tag"
              :is-selected="currentTag.id == tag.id"
              :data-id="tag.id"
              @click.native="doSetCurrentTag(tag, $event)"
              @starsDropped="tagStarWithData"
              @deleteTag="doDeleteTag"
              @renameTag="doRenameTag"
            />
          </ul>
        </div>
      </template>
    </SidebarGroup>
    <SidebarGroup :collapsible="true" :is-collapsed="filtersCollapsed" @toggle="toggleCollapsedState('filters')">
      <template v-slot:header="{ toggleCollapsed }">
        <SidebarHeader title="Smart Filters" @click.native="toggleCollapsed">
          <button
            class="transition-color bg-transparent p-0 w-4 h-4 text-grey-darker hover:text-grey focus-none"
            @click.stop="$modal.show('predicate-modal')"
          >
            <Icon type="PlusCircleIcon" height="16" width="16" class="stroke-current fill-none" />
          </button>
        </SidebarHeader>
      </template>
      <template v-slot:content="{ isCollapsed }">
        <ul v-show="!isCollapsed" ref="sidebarFilters" class="dashboard-list sidebar-predicates list-none m-0 p-0 pb-3">
          <SidebarItem
            v-for="predicate in predicates"
            :key="predicate.id"
            :data-id="predicate.id"
            :title="predicate.name"
            icon="SearchIcon"
            :class="{ selected: currentPredicate.id === predicate.id }"
            class="predicate rounded group"
            @click.native="setCurrentPredicate(predicate)"
          >
            <button
              class="transition-color-opacity ml-auto text-grey focus:outline-none opacity-0 hover:text-white group-hover:opacity-100 hover:text-white"
              @click.stop="editPredicate(predicate)"
            >
              <Icon type="SettingsIcon" height="14" class="stroke-current fill-none relative" />
            </button>
          </SidebarItem>
        </ul>
      </template>
    </SidebarGroup>
    <SidebarGroup :collapsible="true" :is-collapsed="languagesCollapsed" @toggle="toggleCollapsedState('languages')">
      <template v-slot:header="{ toggleCollapsed }">
        <SidebarHeader title="Languages" @click.native="toggleCollapsed" />
      </template>
      <template v-slot:content="{ isCollapsed }">
        <ul v-show="!isCollapsed" class="dashboard-list sidebar-languages list-none m-0 p-0 pb-3">
          <SidebarItem
            v-for="lang in languages"
            :key="lang.name"
            :badge="lang.count"
            :title="lang.name"
            :class="{ selected: currentLanguage == lang.name }"
            class="language rounded"
            @click.native="setCurrentLanguage(lang.name)"
          />
        </ul>
      </template>
    </SidebarGroup>
  </div>
</template>
<script>
import NewTagForm from '@/components/Dashboard/Sidebar/NewTagForm'
import RefreshButton from '@/components/Dashboard/Sidebar/RefreshButton'
import SidebarGroup from '@/components/Dashboard/Sidebar/SidebarGroup'
import SidebarHeader from '@/components/Dashboard/Sidebar/SidebarHeader'
import SidebarItem from '@/components/Dashboard/Sidebar/SidebarItem'
import SidebarTag from '@/components/Dashboard/Sidebar/SidebarTag'
import TagSorter from '@/components/Dashboard/Sidebar/TagSorter'
import Icon from '@/components/Icon'
import { mapActions, mapGetters } from 'vuex'
import dragula from 'dragula'
export default {
  name: 'Sidebar',
  components: {
    NewTagForm,
    RefreshButton,
    SidebarGroup,
    SidebarHeader,
    SidebarItem,
    SidebarTag,
    TagSorter,
    Icon
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
      'predicates',
      'currentPredicate',
      'viewingUntagged',
      'pageInfo',
      'totalStars',
      'totalUntaggedStars',
      'tagsCollapsed',
      'languagesCollapsed',
      'filtersCollapsed'
    ]),
    noFiltersApplied() {
      return (
        !Object.keys(this.currentTag).length &&
        !Object.keys(this.currentPredicate).length &&
        this.currentLanguage === '' &&
        !this.viewingUntagged
      )
    }
  },
  async mounted() {
    await this.fetchTags()
    await this.fetchPredicates()

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

    if (this.$route.query.predicate) {
      const queryPredicate = this.predicates.find(predicate => {
        return predicate.name === this.$route.query.predicate
      })

      if (queryPredicate) {
        this.setCurrentPredicate(queryPredicate)
      }
    }

    this.$bus.$on('TAGS_SORTED', method => {
      this.sortTags(method)
    })

    this.drake = dragula([this.$refs.sidebarTags, this.$refs.sidebarFilters], {
      accepts(el, target, source) {
        return target === source
      }
    }).on('drop', (el, __, source) => {
      let sortMap = Array.from(source.children).map((el, i) => {
        return {
          id: el.dataset.id,
          sort_order: i
        }
      })
      if (source.classList.contains('sidebar-tags')) {
        this.reorderTags(sortMap)
      } else {
        this.reorderPredicates(sortMap)
      }
    })
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
      'cleanupStars',
      'toggleCollapsedState',
      'fetchPredicates',
      'setCurrentPredicate',
      'setEditingPredicate',
      'reorderPredicates'
    ]),
    async refreshStars() {
      this.refreshingStars = true
      this.$bus.$emit('STATUS', 'Refreshing stars...')
      await this.fetchGitHubStars({ cursor: false, refresh: true })
      while (this.pageInfo.hasNextPage) {
        await this.fetchGitHubStars({
          cursor: this.pageInfo.endCursor,
          refresh: false
        })
      }
      await this.cleanupStars()
      this.refreshingStars = false
      this.$bus.$emit('STATUS', '')
    },
    async doAddTag(name) {
      try {
        await this.addTag(name)
        this.$bus.$emit('NOTIFICATION', `${name} tag added!`)
      } catch (e) {
        this.$bus.$emit('NOTIFICATION', e.errors.name[0], 'error')
      }
    },
    async doDeleteTag({ id, name }) {
      try {
        await this.deleteTag(id)
        this.$bus.$emit('NOTIFICATION', `${name} tag deleted!`)
      } catch {
        this.$bus.$emit('NOTIFICATION', 'Whoops, that tag could not be deleted. Please try again.', 'error')
      }
    },
    async doRenameTag(data) {
      const { id, name } = data
      const oldName = this.tags.find(s => s.id === id).name
      try {
        await this.renameTag(data)
        this.$bus.$emit('NOTIFICATION', `${oldName} tag renamed to ${name}`)
      } catch (e) {
        this.$bus.$emit('NOTIFICATION', e.errors.name[0], 'error')
      }
    },
    doSetCurrentTag(tag, e) {
      if (e.target.classList.contains('dashboard-list-item')) {
        this.setCurrentTag(tag)
      }
    },
    resetFilters() {
      this.setViewingUntagged(false)
      this.setCurrentTag({})
      this.setCurrentPredicate({})
      this.setCurrentLanguage('')
    },
    async tagStarWithData({ data, id }) {
      const tag = this.tags.find(tag => tag.id === parseInt(id, 10))
      if (Array.isArray(data)) {
        try {
          await this.addTagToStars({ stars: data, tag })
          this.$bus.$emit('NOTIFICATION', `${tag.name} tag was added to ${data.length} stars!`)
        } catch {
          this.$bus.$emit('NOTIFICATION', 'Whoops, we could not tag that star. Please try again.', 'error')
        }
      } else {
        try {
          await this.addTagToStars({ stars: [data], tag })
          this.$bus.$emit('NOTIFICATION', `${tag.name} tag was added to ${data.nameWithOwner}!`)
        } catch {
          this.$bus.$emit('NOTIFICATION', 'Whoops, we could not tag those stars. Please try again.', 'error')
        }
      }
    },
    async editPredicate(predicate) {
      this.setEditingPredicate(predicate)
      await this.$nextTick()
      this.$modal.show('predicate-modal')
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
