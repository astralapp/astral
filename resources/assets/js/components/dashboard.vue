<template>
  <div class="dashboard">
    <settings-panel :class="{'active': settingsPanelShowing}"></settings-panel>
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
import {
  fetchUser,
  setCurrentTag,
  resetCurrentTag,
  setTagFilter
} from "../store/actions"
import SettingsPanel from "./settings-panel.vue"
import DashboardHeader from "./dashboard-header.vue"
import DashboardSidebar from "./dashboard-sidebar.vue"
import StarList from "./dashboard-star-list.vue"
import Notifier from "./notifier.vue"

export default {
  name: "Dashboard",
  components: {
    "settings-panel": SettingsPanel,
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
      setTagFilter,
      resetCurrentTag
    }
  },
  data () {
    return {
      settingsPanelShowing: false
    }
  },
  ready () {
    if (ls("jwt")) {
      this.fetchUser()
    } else {
      this.$route.router.go("/auth")
    }
    window.addEventListener("keyup", (e) => {
      if (e.keyCode === 27) {
        this.$root.$broadcast("HIDE_SETTINGS_PANEL")
      }
    })
  },
  events: {
    "SHOW_SETTINGS_PANEL": function () {
      this.settingsPanelShowing = true
    },
    "HIDE_SETTINGS_PANEL": function () {
      this.settingsPanelShowing = false
    }
  },
  route: {
    data ({ to }) {
      if (this.$route.path.match(/^\/dashboard\/untagged/g) !== null) {
        this.resetCurrentTag()
        this.setTagFilter("UNTAGGED")
        return true
      }
      if (this.tags.length) {
        if (this.$route.params.tag) {
          const tag = this.tags.find((tag) => {
            return tag.slug === this.$route.params.tag
          })
          if (tag) {
            this.setTagFilter("TAG")
            this.setCurrentTag(tag)
          }
        } else {
          this.setTagFilter("ALL")
          this.resetCurrentTag()
        }
      }
    }
  }
}
</script>
