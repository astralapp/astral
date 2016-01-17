<template>
  <div class="dashboard">
    <dashboard-header :user="user"></dashboard-header>
    <div class="dashboard-main">
      <dashboard-sidebar></dashboard-sidebar>
      <star-list></star-list>
    </div>
  </div>
</template>
<script>
import userStore from "./../stores/userStore.js";
import DashboardHeader from "./dashboard-header.vue";
import DashboardSidebar from "./dashboard-sidebar.vue";
import StarList from "./dashboard-star-list.vue";
export default {
  name: "Dashboard",
  data() {
    return {}
  },
  computed: {
    user() {
      return userStore.state.user;
    },
  },
  ready() {
    userStore.actions.fetchUser()
  },
  components: {
    "dashboard-header": DashboardHeader,
    "dashboard-sidebar": DashboardSidebar,
    "star-list": StarList
  }
}
</script>
