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
import { mapGetters, mapActions } from 'vuex'
import ls from 'local-storage'
import SettingsPanel from './settings-panel.vue'
import DashboardHeader from './dashboard-header.vue'
import DashboardSidebar from './dashboard-sidebar.vue'
import StarList from './dashboard-star-list.vue'
import Notifier from './notifier.vue'

export default {
  name: 'Dashboard',
  components: {
    'settings-panel': SettingsPanel,
    'dashboard-header': DashboardHeader,
    'dashboard-sidebar': DashboardSidebar,
    'star-list': StarList,
    'notifier': Notifier
  },
  data () {
    return {
      settingsPanelShowing: false
    }
  },
  computed: {
    ...mapGetters([
      'tags',
      'user'
    ])
  },
  methods: {
    ...mapActions([
      'fetchUser',
      'setCurrentTag',
      'setTagFilter',
      'resetCurrentTag'
    ])
  },
  created () {
    if (ls('jwt')) {
      this.fetchUser()
    } else {
      this.$router.push('/auth')
    }
    window.addEventListener('keyup', (e) => {
      if (e.keyCode === 27) {
        this.$bus.$emit('HIDE_SETTINGS_PANEL')
      }
    })

    this.$bus.$on('SHOW_SETTINGS_PANEL', () => { this.settingsPanelShowing = true })
    this.$bus.$on('HIDE_SETTINGS_PANEL', () => { this.settingsPanelShowing = false })

    this.$router.afterEach((to, from) => {
      console.log(to)
      if (to.path.match(/^\/dashboard\/untagged/g) !== null) {
        this.resetCurrentTag()
        this.setTagFilter('UNTAGGED')
        return true
      }
      if (this.tags.length) {
        if (typeof to.params.tag !== 'undefined' ) {
          const tag = this.tags.find((tag) => {
            return tag.slug === to.params.tag
          })
          if (tag) {
            this.setTagFilter('TAG')
            this.setCurrentTag(tag)
          } else {
            this.setTagFilter('ALL')
            this.resetCurrentTag()
          }
        } else {
          this.setTagFilter('ALL')
          this.resetCurrentTag()
        }
      }
    })
  }
}
</script>
