<template>
<div class="sidebar-sortDropdown">
  <button class="bg-transparent text-sm uppercase flex items-center cursor-pointer text-grey-darker hover:text-grey transition-color" :class="{'active': dropdownVisible}" @click.stop="toggleDropdown">
    <span>Sort</span>
    <feather-icon
      type="chevron-down"
      height="16"
      width="16"
      class="transition-stroke stroke-current fill-none ml-1"
    >
    </feather-icon>
  </button>
</div>  
</template>
<script>
export default {
  name: 'SortTags',
  data() {
    return {
      dropdownVisible: false
    }
  },
  methods: {
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible
    }
  }
}
</script>
