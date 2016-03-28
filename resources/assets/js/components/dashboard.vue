<template>
  <div class="dashboard">
    <dashboard-header></dashboard-header>
    <div class="dashboard-main">
      <dashboard-sidebar></dashboard-sidebar>
      <star-list></star-list>
    </div>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters";
import { fetchUser } from "../store/actions";
import DashboardHeader from "./dashboard-header.vue";
import DashboardSidebar from "./dashboard-sidebar.vue";
import StarList from "./dashboard-star-list.vue";
export default {
  name: "Dashboard",
  vuex: {
    getters: {
      user: user
    },
    actions: {
      fetchUser
    }
  },
  ready() {
    this.fetchUser()
  },
  components: {
    "dashboard-header": DashboardHeader,
    "dashboard-sidebar": DashboardSidebar,
    "star-list": StarList
  }
}
</script>
