<template>
  <div class="dashboard-userDropdownMenu" v-show="visible" transition="dashboard-userDropdownMenu">
    <ul class="dashboard-userDropdownMenuItems">
      <li class="dashboard-userDropdownMenuItem"><a href="#" @click.prevent="showSettingsPanel">Settings</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="mailto:hello@astralapp.com">Support & Feedback</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="https://github.com/astralapp/astral" target="_blank" rel="noopener">GitHub</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="https://www.creatorlove.com/syropian/astral" target="_blank" rel="noopener"><i class="fa fa-heart"></i> Creator Love</a></li>
      <li class="dashboard-userDropdownMenuItem"><a href="/api/auth/logout" @click.prevent="logout">Sign Out</a></li>
    </ul>
  </div>
</template>
<script>
import ls from "local-storage"

export default {
  name: "UserDropdown",
  props: ["visible"],
  methods: {
    showSettingsPanel () {
      this.$root.$broadcast("SHOW_SETTINGS_PANEL")
    },
    logout () {
      ls.remove("jwt")
      ls.remove("access_token")
      window.location = "/api/auth/logout"
    }
  }
}
</script>
