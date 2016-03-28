<template>
  <div>
    <router-view></router-view>
  </div>
</template>
<script>
  import store from './../store/store';
  export default {
    name: "App",
    store: store
  }
</script>
