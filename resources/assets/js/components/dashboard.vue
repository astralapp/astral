<template>
  <h1>This is the dashboard!</h1>
  <h3>Sup {{ user.name }}</h3>
</template>
<script>
import store from "./../stores/store.js";
export default {
  data() {
    return {}
  },
  computed: {
    user() {
      return store.state.user;
    }
  },
  ready() {
    store.actions.fetchUser()
  }
}
</script>
