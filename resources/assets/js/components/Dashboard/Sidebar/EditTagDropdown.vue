<template>
<div class="edit-tag-dropdown absolute pin-r right-0 bg-white rounded w-24 box-shadow overflow-hidden" v-show="visible">
  <ul class="tag-sort-items list-reset mv2 pa0">
    <li class="text-xs text-grey-darkest hover:bg-grey-lightest cursor-pointer block py-3 pl-3 pr-4 whitespace-no-wrap" @click.stop="renameTag">Rename</li>
    <li class="text-xs text-red hover:bg-grey-lightest cursor-pointer block py-3 pl-3 pr-4 whitespace-no-wrap" @click.stop="deleteTag">Delete</li>
  </ul>
</div>
</template>
<script>
export default {
  name: 'EditTagDropdown',
  props: ['visible'],
  methods: {
    renameTag() {
      this.$emit('renameTag')
    },
    deleteTag() {
      this.$emit('deleteTag')
    }
  }
}
</script>
<style lang="scss">
.edit-tag-dropdown {
  background-clip: padding-box;
  border: 1px solid rgba(#364349, 0.1);
  top: 20px;
  z-index: 99;
}
</style>


