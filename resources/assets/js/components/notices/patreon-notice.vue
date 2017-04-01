<template>
  <div class="noticePanel">
    <div class="noticePanel-panel">
      <div class="noticePanel-panelContent">
        <div class="left">
          <img src="../../../images/patreon-bg.svg" alt="">
        </div>
        <div class="right">
          <h3>Support Astral on Patreon!</h3>
          <p>Love Astral, and want to support its ongoing development? I now have a Patreon campaign where you can pledge monthly to help me cover the costs to build and maintain it.</p>
          <p>If you'd like to decide later, you can always access the link in your user menu on the top right! Thanks, and star on! <span style="color:#ca2c30;"><i class="fa fa-heart"></i></span>&nbsp;<span style="color:#fee750;"><i class="fa fa-star"></i></span></p>
          <div class="patreon-buttons">
            <button class="btn-flat" @click="goToPatreonPage">Learn More</button>
            <button class="btn-text btn-danger" @click="dismissPanel">No Thanks</button>
          </div>
        </div>
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
<style lang="scss" scoped>
.noticePanel-panel {
  width: 800px;
  .noticePanel-panelContent {
    display: flex;
    .left, .right { width: 50%; }
    .left img {
      width: 100%;
      align-self: center;
    }
    .left {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 20px;
      h3 {
        align-self: flex-start;
        border-bottom: 4px solid #56a07b;
        margin-top: 0;
        padding-bottom: 5px;
      }
    }
  }
  .patreon-buttons {
    margin-top: 20px;
    display: flex;
    button {
      margin: 0 5px;
      &.btn-flat { font-size: 18px; }
    }
  }
}
</style>
