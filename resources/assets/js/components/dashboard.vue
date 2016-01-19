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
import store from "../store/store.js";
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
      return store.state.user;
    },
  },
  ready() {
    store.actions.fetchUser()
  },
  components: {
    "dashboard-header": DashboardHeader,
    "dashboard-sidebar": DashboardSidebar,
    "star-list": StarList
  }
}
</script>
