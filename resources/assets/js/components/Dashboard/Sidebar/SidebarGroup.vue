<template>
  <div class="sidebar-group" :class="{'is-collapsible': collapsible}">
    <div :class="{'cursor-pointer': collapsible}" class="flex items-center text-grey-darker">
      <Icon
        :type="isCollapsed ? 'ChevronRightIcon' : 'ChevronDownIcon'"
        class="transition-stroke stroke-current fill-none mr-1"
        height="16"
        width="16"
        v-if="collapsible"
        @click="toggleCollapsed"
      />
      <slot name="header" :toggleCollapsed="toggleCollapsed"></slot>
    </div>
    <slot name="content" :isCollapsed="isCollapsed"></slot>
  </div>
</template>

<script>
import Icon from '@/components/Icon'
export default {
  components: {
    Icon
  },
  props: ['collapsible'],
  data() {
    return {
      isCollapsed: false
    }
  },
  methods: {
    toggleCollapsed() {
      if (this.collapsible) {
        this.isCollapsed = !this.isCollapsed
      }
    }
  }
}
</script>

<style>
</style>
