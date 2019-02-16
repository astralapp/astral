<template>
  <div class="dashboard-list-item toggle-new-tag h-10 relative">
    <Transition name="new-tag-form">
      <div
        v-show="!formShowing"
        class="toggle-new-tag-button flex items-center text-base font-semibold text-grey-darker h-10 cursor-pointer transition-color hover:text-grey"
        @click="showForm"
      >
        <Icon
          type="PlusCircleIcon"
          height="14"
          class="mr-1 pointer-events-none stroke-current fill-none transition-stroke"
        />
        <span class="dashboard-list-item-name relative flex-grow">Add a tag...</span>
      </div>
    </Transition>
    <Transition name="new-tag-form">
      <form
        v-show="formShowing"
        class="toggle-new-tag-form flex items-center absolute pin-t pin-l w-full"
        @submit.prevent="formSubmitted"
      >
        <input
          ref="form"
          v-model="tagName"
          class="h-10 text-base rounded bg-white px-2 w-full"
          type="text"
          placeholder="Enter a tag name..."
          @blur="formBlurred"
        >
      </form>
    </Transition>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
export default {
  name: 'NewTagForm',
  components: {
    Icon
  },
  data () {
    return {
      formShowing: false,
      tagName: ''
    }
  },
  methods: {
    showForm () {
      this.formShowing = true
      setTimeout(() => {
        this.$refs.form.focus()
      }, 0)
    },
    formBlurred () {
      if (this.tagName.trim() === '') {
        this.formShowing = false
      }
    },
    formSubmitted () {
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
