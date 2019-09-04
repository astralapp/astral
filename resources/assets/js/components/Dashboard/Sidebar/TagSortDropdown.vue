<template>
  <div v-show="visible" class="dropdown tag-sort-dropdown">
    <ul class="tag-sort-items">
      <li class="tag-sort-item dropdown-item text-xs py-3 pl-3 pr-4 whitespace-no-wrap" @click.stop="sortTags('ALPHA_ASC')">
        <i class="fas fa-sort-alpha-down mr1" /> Alphabetical (A-Z)
      </li>
      <li class="tag-sort-item dropdown-item text-xs py-3 pl-3 pr-4 whitespace-no-wrap" @click.stop="sortTags('ALPHA_DESC')">
        <i class="fas fa-sort-alpha-up mr1" /> Alphabetical (Z-A)
      </li>
      <li class="tag-sort-item dropdown-item text-xs py-3 pl-3 pr-4 whitespace-no-wrap" @click.stop="sortTags('STARS_DESC')">
        <i class="fas fa-sort-numeric-down mr1" /> Most Stars
      </li>
      <li class="tag-sort-item dropdown-item text-xs py-3 pl-3 pr-4 whitespace-no-wrap" @click.stop="sortTags('STARS_ASC')">
        <i class="fas fa-sort-numeric-up mr1" /> Fewest Stars
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'TagSortDropdown',
  props: {
    visible: Boolean
  },
  methods: {
    sortTags(method) {
      this.$bus.$emit('TAGS_SORTED', method)
    }
  }
}
</script>
<style lang="scss" scoped>
.tag-sort-dropdown {
  margin-top: 20px;
}
</style>
