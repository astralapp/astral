<template>
  <div>
    <transition name="router" appear><router-view></router-view></transition>
  </div>
</template>
<script>
  import store from "./../store/store"

  export default {
    name: "App",
    store: store
  }
</script>
