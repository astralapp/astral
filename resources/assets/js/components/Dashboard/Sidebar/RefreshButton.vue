<template>
<button class="refresh-stars bg-transparent p-0 w-4 h-4 text-grey-darker" :class="{ 'active': active }">
  <Icon
    type="RefreshCwIcon"
    height="16"
    width="16"
    class="stroke-current fill-none"
  >
  </Icon>
</button>
</template>
<script>
import Icon from '@/components/Icon'
export default {
  name: 'RefreshButton',
  props: ['active'],
  components: {
    Icon
  }
}
</script>
<style lang="scss">
.refresh-stars {
  svg {
    transition: stroke 150ms ease;
  }
  &:hover svg {
    stroke: config('colors.grey');
  }
}
</style>
