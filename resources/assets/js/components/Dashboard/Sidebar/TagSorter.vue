<template>
  <div class="sidebar-sortDropdown">
    <button
      class="bg-transparent text-sm uppercase flex items-center cursor-pointer text-grey-darker hover:text-grey transition-color focus-none"
      :class="{'text-grey': dropdownVisible}"
      @click.stop="toggleDropdown"
      v-click-outside="hideDropdown">
      <span>Sort</span>
      <Icon
        type="ChevronDownIcon"
        class="transition-stroke stroke-current fill-none ml-1"
        height="16"
        width="16"
      />
    </button>
    <tag-sort-dropdown :visible="dropdownVisible"/>
  </div>
</template>
<script>
import vClickOutside from 'v-click-outside'
import TagSortDropdown from '@/components/Dashboard/Sidebar/TagSortDropdown'
import Icon from '@/components/Icon'
export default {
  name: 'TagSorter',
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {
    Icon,
    TagSortDropdown
  },
  data () {
    return {
      dropdownVisible: false
    }
  },
  mounted () {
    this.$bus.$on('TAGS_SORTED', method => (this.dropdownVisible = false))
  },
  methods: {
    toggleDropdown () {
      this.dropdownVisible = !this.dropdownVisible
    },
    hideDropdown () {
      this.dropdownVisible = false
    }
  }
}
</script>
