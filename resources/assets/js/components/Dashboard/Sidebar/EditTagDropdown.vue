<template>
  <div
    v-show="visible"
    class="edit-tag-dropdown absolute pin-r right-0 bg-white rounded w-48 box-shadow overflow-hidden p-3"
    @click.stop>
    <form
      class="flex flex-col"
      @submit.prevent="renameTag">
      <input
        v-model="tagName"
        type="text"
        class="text-input text-sm py-1 px-2 mb-4 w-full">
      <button class="btn btn-brand text-sm py-1 px-3 mb-2">Save</button>
      <button
        class="btn btn-danger text-sm py-1 px-3"
        @click.stop.prevent="deleteTag">Delete</button>
    </form>
  </div>
</template>
<script>
export default {
  name: 'EditTagDropdown',
  props: ['visible', 'tag'],
  data () {
    return {
      tagName: this.tag.name
    }
  },
  methods: {
    renameTag () {
      this.$emit('renameTag', this.tagName)
    },
    deleteTag () {
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
