<template>
<div class="sidebar-sortDropdown">
  <button class="bg-transparent text-sm uppercase flex items-center cursor-pointer text-grey-darker hover:text-grey transition-color focus-none" :class="{'text-grey': dropdownVisible}" @click.stop="toggleDropdown" v-on-clickaway="hideDropdown">
    <span>Sort</span>
    <feather-icon
      type="chevron-down"
      height="16"
      width="16"
      class="transition-stroke stroke-current fill-none ml-1"
    >
    </feather-icon>
  </button>
  <tag-sort-dropdown :visible="dropdownVisible"></tag-sort-dropdown>
</div>  
</template>
<script>
import { mixin as clickaway } from 'vue-clickaway'
import TagSortDropdown from './TagSortDropdown'
export default {
  name: 'SortTags',
  mixins: [clickaway],
  components: {
    TagSortDropdown
  },
  data() {
    return {
      dropdownVisible: false
    }
  },
  mounted() {
    this.$bus.$on('TAGS_SORTED', method => (this.dropdownVisible = false))
  },
  methods: {
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible
    },
    hideDropdown() {
      this.dropdownVisible = false
    }
  }
}
</script>
