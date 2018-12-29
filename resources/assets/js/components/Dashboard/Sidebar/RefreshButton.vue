<template>
  <button
    :class="{ 'active': active }"
    class="refresh-stars bg-transparent p-0 w-4 h-4 text-grey-darker focus-none"
  >
    <Icon
      type="RefreshCwIcon"
      height="16"
      width="16"
      class="stroke-current fill-none"
    />
  </button>
</template>
<script>
import Icon from '@/components/Icon'
export default {
  name: 'RefreshButton',
  components: {
    Icon
  },
  props: ['active']
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
  &.active {
    animation: spin 750ms linear 0s infinite;
    opacity: 0.75;
    pointer-events: none;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
