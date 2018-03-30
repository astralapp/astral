<template>
<div class="tag-sort-dropdown absolute pin-r right-0 bg-white rounded w-48 box-shadow overflow-hidden" v-show="visible">
  <ul class="tag-sort-items list-reset mv2 pa0">
    <li class="tag-sort-item text-xs text-grey-darkest hover:bg-grey-lightest cursor-pointer block py-3 pl-3 pr-4 whitespace-no-wrap" @click="sortTags('ALPHA_ASC')"><i class="fas fa-sort-alpha-down mr1"></i> Alphabetical (A-Z)</li>
    <li class="tag-sort-item text-xs text-grey-darkest hover:bg-grey-lightest cursor-pointer block py-3 pl-3 pr-4 whitespace-no-wrap" @click="sortTags('ALPHA_DESC')"><i class="fas fa-sort-alpha-up mr1"></i> Alphabetical (Z-A)</li>
    <li class="tag-sort-item text-xs text-grey-darkest hover:bg-grey-lightest cursor-pointer block py-3 pl-3 pr-4 whitespace-no-wrap" @click="sortTags('STARS_DESC')"><i class="fas fa-sort-numeric-down mr1"></i> Most Stars</li>
    <li class="tag-sort-item text-xs text-grey-darkest hover:bg-grey-lightest cursor-pointer block py-3 pl-3 pr-4 whitespace-no-wrap" @click="sortTags('STARS_ASC')"><i class="fas fa-sort-numeric-up mr1"></i> Fewest Stars</li>
  </ul>
</div>
</template>
<script>
export default {
  name: 'TagSortDropdown',
  props: ['visible'],
  methods: {
    sortTags (method) {
      this.$bus.$emit('TAGS_SORTED', method)
    }
  }
}
</script>
<style lang="scss">
.tag-sort-dropdown {
  background-clip: padding-box;
  border: 1px solid rgba(#364349, 0.1);
  top: 20px;
  z-index: 99;
}
</style>
