<template>
<div class="dashboard-list-item toggle-new-tag h-10 relative">
  <transition name="new-tag-form">
    <div class="toggle-new-tag-button flex items-center text-base font-semibold text-grey-darker h-10 cursor-pointer transition-color hover:text-grey" @click="showForm" v-show="!formShowing">
      <feather-icon
      type="plus-circle"
      height="14"
      class="mr-1 pointer-events-none stroke-current fill-none transition-stroke"
    >
    </feather-icon>
      <span class="dashboard-list-item-name relative flex-grow">Add a tag...</span>
    </div>
  </transition>
  <transition name="new-tag-form">
    <form class="toggle-new-tag-form flex items-center absolute pin-t pin-l w-full" v-show="formShowing" @submit.prevent="formSubmitted">
      <input class="h-10 text-base rounded bg-white px-2 w-full" type="text" v-model="tagName" @blur="formBlurred" ref="form" placeholder="Enter a tag name...">
    </form>
  </transition>
</div>
</template>

<script>
export default {
  name: 'new-tag-form',
  data() {
    return {
      formShowing: false,
      tagName: ''
    }
  },
  methods: {
    showForm() {
      this.formShowing = true
      setTimeout(() => {
        this.$refs.form.focus()
      }, 0)
    },
    formBlurred() {
      if (this.tagName.trim() === '') {
        this.formShowing = false
      }
    },
    formSubmitted() {
      this.$emit('submit', this.tagName)
      this.tagName = ''
    }
  }
}
</script>
<style lang="scss">
.new-tag-form-enter-active,
.new-tag-form-leave-active {
  transition: opacity 250ms ease;
}
.new-tag-form-enter,
.new-tag-form-leave-to {
  opacity: 0;
}
.toggle-new-tag {
  &-form {
    input {
      &:focus {
        outline: none;
      }
    }
  }
}
</style>