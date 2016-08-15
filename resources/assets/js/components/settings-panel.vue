<template>
  <div class="settingsPanel" @click.self="closePanel">
    <div class="settingsPanel-panel">
      <div class="settingsPanel-header">
        <h3>Settings</h3>
        <button class="settingsPanel-closePanel" @click="closePanel"><span>&times;</span></button>
      </div>
      <div class="settingsPanel-panelContent">
        <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Auto-Tag by Language
          </div>
          <div class="settingsPanel-settingControl">
            <toggle-switch :checked="user.autotag" key="languageAutotag" :change="setUserAutoTagPref"></toggle-switch>
          </div>
        </div>
        <!-- <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Use Night Theme&nbsp;&nbsp;<i class="fa fa-moon-o"></i>
          </div>
          <div class="settingsPanel-settingControl">
            <toggle-switch :checked.sync="nightTheme" key="nightTheme"></toggle-switch>
          </div>
        </div> -->
        <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Export Stars As JSON
          </div>
          <div class="settingsPanel-settingControl">
            <button class="btn-flat">Export</button>
          </div>
        </div>
      </div>
      <div class="settingsPanel-footer">
        <button class="btn-flat" @click="closePanel">Done</button>
      </div>
    </div>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters"
import { setUserAutoTag } from "../store/actions"
import ToggleSwitch from "./toggle-switch.vue"
export default {
  name: "SettingsPanel",
  components: {
    "toggle-switch": ToggleSwitch
  },
  vuex: {
    getters: { user },
    actions: { setUserAutoTag }
  },
  methods: {
    setUserAutoTagPref (e) {
      this.setUserAutoTag(e.target.checked)
    },
    closePanel () {
      this.$root.$broadcast("HIDE_SETTINGS_PANEL")
    }
  }
}
</script>
