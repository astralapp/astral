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
          <!-- <div class="settingsPanel-settingDescription">
            Automatically adds a tag based on the repo's base language.
          </div> -->
          <div class="settingsPanel-settingControl">
            <toggle-switch :checked="user.autotag" :ukey="'languageAutotag'" :change="setUserAutoTagPref"></toggle-switch>
          </div>
        </div>
        <div class="settingsPanel-row">
          <div class="settingsPanel-settingName">
            Export Stars As JSON
          </div>
          <div class="settingsPanel-settingControl">
            <a :href="exportUrl" target="_blank" rel="noopener" class="btn-flat">Export</a>
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
import ls from 'local-storage'
import { mapActions, mapGetters } from 'vuex'
import ToggleSwitch from './toggle-switch.vue'
export default {
  name: 'SettingsPanel',
  components: {
    'toggle-switch': ToggleSwitch
  },
  data () {
    return {
      exportUrl: `/api/auth/user/exportData?token=${ls('jwt')}`
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  methods: {
    ...mapActions([
      'setUserAutoTag'
    ]),
    setUserAutoTagPref (e) {
      this.setUserAutoTag(e.target.checked)
    },
    closePanel () {
      this.$bus.$emit('HIDE_SETTINGS_PANEL')
    }
  }
}
</script>
