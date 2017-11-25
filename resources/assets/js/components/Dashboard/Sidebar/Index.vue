<template>
  <div class="sidebar bg-black py-8 overflow-y-scroll px-4">
    <sidebar-header title="Stars">
      <refresh-button :active="refreshingStars" @click.native="refreshStars"></refresh-button>
    </sidebar-header>
    <ul class="dashboard-list sidebar-stars list-none m-0 p-0 border-b border-black pb-3">
      <sidebar-item 
        :class="{ 'selected': noFiltersApplied }"
        class="all-stars" 
        title="All Stars" 
        icon="inbox" 
        icon-size="16" 
        @click.native="resetFilters"
      >
      </sidebar-item>
      <sidebar-item class="untagged-stars" title="Untagged Stars" icon="star" icon-size="16"></sidebar-item>
    </ul>
    <sidebar-header title="Tags">
      <sort-tags></sort-tags>
    </sidebar-header>
    <new-tag-form @submit="doAddTag"></new-tag-form>
    <ul class="dashboard-list sidebar-tags list-none m-0 p-0 border-b border-black pb-3">
      <sidebar-item 
        v-for="tag in tags" 
        :key="tag.id" 
        :data-id="tag.id" 
        :badge="tag.stars_count"
        :title="tag.name" 
        class="tag rounded" 
        ref="tag" 
        icon="tag" 
        icon-size="14" 
        :class="{ 'selected': currentTag.id == tag.id }"
        :star-target="true"
        @starDropped="tagStarWithData"
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
import NewTagForm from './NewTagForm'
import RefreshButton from './RefreshButton'
import SidebarHeader from './SidebarHeader'
import SidebarItem from './SidebarItem'
import SortTags from './SortTags'
import { mapActions, mapGetters } from 'vuex'
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
      refreshingStars: false
    }
  },
  computed: {
    ...mapGetters(['tags', 'currentTag', 'languages', 'currentLanguage']),
    noFiltersApplied() {
      return !Object.keys(this.currentTag).length && this.currentLanguage === ''
    }
  },
  mounted() {
    this.fetchTags()
  },
  methods: {
    ...mapActions([
      'addTag',
      'fetchTags',
      'setCurrentTag',
      'setCurrentLanguage',
      'pushStarTag'
    ]),
    refreshStars() {
      console.log('Refreshing Stars...')
    },
    doAddTag(name) {
      this.addTag(name)
    },
    resetFilters() {
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

