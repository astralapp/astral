<template>
  <div class="settingsPanel" @click.self="closePanel">
    <div class="settingsPanel-panel">
      <div class="settingsPanel-header">
        <h3>Settings</h3>
        <button class="settingsPanel-closePanel" @click="closePanel">&times;</button>
      </div>
      <div class="settingsPanel-panelContent">
        <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Auto-Tag by Language
          </div>
          <div class="settingsPanel-settingControl">
            <toggle-switch :checked.sync="languageAutotag" key="languageAutotag"></toggle-switch>
          </div>
        </div>
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
import ToggleSwitch from "./toggle-switch.vue"
export default {
  name: "SettingsPanel",
  components: {
    "toggle-switch": ToggleSwitch
  },
  data() {
    return {
      languageAutotag: true
    }
  },
  methods: {
    closePanel () {
      this.$root.$broadcast("HIDE_SETTINGS_PANEL")
    }
  }
}
</script>
