<template>
<button class="refresh-stars bg-transparent p-0 w-4 h-4 text-grey-darker" :class="{ 'active': active }">
  <feather-icon
    type="refresh-cw"
    height="16"
    width="16"
    class="stroke-current fill-none"
  >
  </feather-icon>
</button>
</template>
<script>
export default {
  name: 'RefreshButton',
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
}
</style>


