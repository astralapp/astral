<template>
<div class="edit-tag-dropdown absolute pin-r right-0 bg-white rounded w-64 box-shadow overflow-hidden p-4" v-show="visible" @click.stop>
  <form class="flex flex-col" @submit.prevent="renameTag">
    <input type="text" v-model="tagName" class="text-grey-darkest border-2 border-grey-light focus:border-grey rounded py-2 px-3 mb-4 w-full focus-none appearance-none transition-border-color">
    <button class="bg-brand hover:bg-brand-light text-white font-bold py-2 px-4 rounded mb-2">Save</button>
    <button class="bg-red hover:bg-red-dark text-white font-bold py-2 px-4 rounded" @click.stop.prevent="deleteTag">Delete</button>
  </form>
</div>
</template>
<script>
export default {
  name: 'EditTagDropdown',
  props: ['visible', 'tag'],
  data() {
    return {
      tagName: this.tag.name
    }
  },
  methods: {
    renameTag() {
      this.$emit('renameTag', this.tagName)
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


