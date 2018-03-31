<template>
  <div class="dashboard w-screen h-screen overflow-hidden">
    <navbar></navbar>
    <sidebar></sidebar>
    <galileo></galileo>
    <star-list :stars="starsWithCurrentTag"></star-list>
    <star-info></star-info>
    <div><notifier timeout="3000"></notifier></div>
    <settings-modal :user="user"></settings-modal>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Navbar from '@/components/Dashboard/Navbar'
import Sidebar from '@/components/Dashboard/Sidebar/'
import StarList from '@/components/Dashboard/StarList'
import Galileo from '@/components/Dashboard/Galileo'
import StarInfo from '@/components/Dashboard/StarInfo'
import SettingsModal from '@/components/Dashboard/SettingsModal'
import Notifier from '@/components/Notifier'
export default {
  name: 'Dashboard',
  components: {
    Galileo,
    Navbar,
    StarInfo,
    Sidebar,
    StarList,
    SettingsModal,
    Notifier
  },
  computed: {
    ...mapGetters(['user', 'stars', 'pageInfo', 'currentTag', 'currentStar']),
    starsWithCurrentTag() {
      return this.stars.filter(star => {
        if (!Object.keys(this.currentTag).length) {
          return true
        } else {
          return (
            star.hasOwnProperty('tags') &&
            star.tags.map(tag => tag.name).includes(this.currentTag.name)
          )
        }
      })
    }
  },
  methods: {
    ...mapActions([
      'fetchUser',
      'fetchGitHubStars',
      'fetchUserStars',
      'cleanupStars'
    ])
  },
  async created() {
    await this.fetchUser()
    await this.fetchUserStars()
    await this.fetchGitHubStars({ cursor: null, refresh: false })
    while (this.pageInfo.hasNextPage) {
      await this.fetchGitHubStars({
        cursor: this.pageInfo.endCursor,
        refresh: false
      })
    }
    await this.cleanupStars()
  }
}
</script>
<style lang="scss">
.dashboard {
  display: grid;
  grid-template-columns: 280px 400px 1fr;
  grid-template-rows: 72px 64px 1fr;
  header {
    grid-column: 1 / 4;
  }
  .sidebar {
    grid-column: 1 / 2;
    grid-row: 2 / 4;
  }
  .search-container {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }
  .stars {
    grid-column: 2 / 3;
    grid-row: 3 / 4;
  }
  .star-info {
    grid-column: 3 / 4;
    grid-row: 2 / 4;
    min-width: 0;
  }
}
</style>
