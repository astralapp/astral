<template>
  <div class="dashboard">
    <dashboard-header></dashboard-header>
    <div class="dashboard-main">
      <dashboard-sidebar></dashboard-sidebar>
      <star-list></star-list>
    </div>
    <div><notifier timeout="3000"></notifier></div>
  </div>
</template>
<script>
import ls from "local-storage"
import { user } from "../store/getters/userGetters"
import { tags } from "../store/getters/tagsGetters"
import { fetchUser, setCurrentTag, resetCurrentTag } from "../store/actions"
import DashboardHeader from "./dashboard-header.vue"
import DashboardSidebar from "./dashboard-sidebar.vue"
import StarList from "./dashboard-star-list.vue"
import Notifier from "./notifier.vue"

export default {
  name: "Dashboard",
  components: {
    "dashboard-header": DashboardHeader,
    "dashboard-sidebar": DashboardSidebar,
    "star-list": StarList,
    "notifier": Notifier
  },
  vuex: {
    getters: {
      tags,
      user: user
    },
    actions: {
      fetchUser,
      setCurrentTag,
      resetCurrentTag
    }
  },
  ready () {
    if (ls("jwt")) {
      this.fetchUser()
    } else {
      this.$route.router.go("/auth")
    }
  },
  route: {
    data ({ to }) {
      if (this.tags.length) {
        if (this.$route.params.tag) {
          const tag = this.tags.find((tag) => {
            return tag.slug === this.$route.params.tag
          })
          if (tag) {
            this.setCurrentTag(tag)
          }
        } else {
          this.resetCurrentTag()
        }
      }
    }
  }
}
</script>
