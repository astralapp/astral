<template>
  <h1>This is the dashboard!</h1>
  <h3>Sup {{ user.name }}</h3>
  <hr />
  <ul>
    <li v-for="star in stars">
      {{ star.full_name }}
    </li>
  </ul>
</template>
<script>
import userStore from "./../stores/userStore.js";
import githubStore from "./../stores/githubStore.js";
export default {
  name: "Dashboard",
  data() {
    return {}
  },
  computed: {
    user() {
      return userStore.state.user;
    },
    stars() {
      return githubStore.state.stars;
    }
  },
  ready() {
    userStore.actions.fetchUser()
    githubStore.actions.fetchStars()
  }
}
</script>
