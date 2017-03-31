<template>
  <div class="noticePanel">
    <div class="noticePanel-panel">
      <div class="noticePanel-header">
        <h3>Support me on Patreon!</h3>
      </div>
      <div class="noticePanel-panelContent">
        <p>Love Astral, and want to support its ongoing development? I now have a Patreon campaign where you can pledge monthly to help me cover the costs to build and maintain it.</p>
        <p>If you'd like to decide later, you can always access the link in your user menu on the top right! Thanks <span style="color:#ca2c30;">&hearts;</span></p>
      </div>
      <div class="noticePanel-footer">
        <button class="btn-flat" @click="goToPatreonPage">Learn More</button>
        <button class="btn-outline" @click="dismissPanel">No Thanks</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'PatreonNotice',
  methods: {
    ...mapActions([
      'setUserSeenPatreonNotice'
    ]),
    dismissPanel () {
      this.setUserSeenPatreonNotice()
    },
    goToPatreonPage () {
      window.open('https://www.patreon.com/syropian')
      this.setUserSeenPatreonNotice()
    }
  }
}
</script>
