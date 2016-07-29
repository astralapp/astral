<template>
  <div>
    <router-view transition="router"></router-view>
  </div>
</template>
<script>
  import store from "./../store/store"

  export default {
    name: "App",
    store: store
  }
</script>
