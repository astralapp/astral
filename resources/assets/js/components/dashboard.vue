<template>
  <div class="dashboard" @click="hideUserDropdown">
    <dashboard-header></dashboard-header>
    <div class="dashboard-main">
      <dashboard-sidebar></dashboard-sidebar>
      <star-list></star-list>
    </div>
    <div><notifier timeout="3000"></notifier></div>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters";
import { fetchUser } from "../store/actions";
import DashboardHeader from "./dashboard-header.vue";
import DashboardSidebar from "./dashboard-sidebar.vue";
import StarList from "./dashboard-star-list.vue";
import Notifier from "./notifier.vue";
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
  methods: {
    hideUserDropdown(){
      this.$broadcast("HIDE_USER_DROPDOWN");
    }
  },
  components: {
    "dashboard-header": DashboardHeader,
    "dashboard-sidebar": DashboardSidebar,
    "star-list": StarList,
    "notifier": Notifier
  }
}
</script>
