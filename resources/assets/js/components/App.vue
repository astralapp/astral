<template>
  <div id="app" class="overflow-hidden">
    <Transition name="screen-fade" mode="out-in" appear>
      <RouterView />
    </Transition>
  </div>
</template>
<script>
export default {
  name: 'App'
}
</script>
<style lang="scss">
#app {
  background-color: config('colors.brand');
  min-height: 100vh;
}

.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 250ms ease;
}
.screen-fade-enter,
.screen-fade-leave-to {
  opacity: 0;
}
</style>
