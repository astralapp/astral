<template>
  <div class="dashboard w-screen h-screen overflow-hidden">
    <Navbar />
    <Sidebar />
    <Galileo />
    <StarList :stars="starsWithCurrentTag" />
    <StarInfo />
    <div><Notifier :timeout="3000" /></div>
    <SettingsModal :user="user" />
    <PredicateModal />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Navbar from '@/components/Dashboard/Navbar'
import Sidebar from '@/components/Dashboard/Sidebar/Index'
import StarList from '@/components/Dashboard/StarList'
import Galileo from '@/components/Dashboard/Galileo'
import StarInfo from '@/components/Dashboard/StarInfo'
import SettingsModal from '@/components/Dashboard/SettingsModal'
import PredicateModal from '@/components/Dashboard/PredicateModal'
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
    PredicateModal,
    Notifier
  },
  computed: {
    ...mapGetters(['user', 'stars', 'pageInfo', 'currentTag', 'currentStar']),
    starsWithCurrentTag() {
      return this.stars.filter(star => {
        if (!Object.keys(this.currentTag).length) {
          return true
        } else {
          return star.hasOwnProperty('tags') && star.tags.map(tag => tag.name).includes(this.currentTag.name)
        }
      })
    }
  },
  async created() {
    await this.fetchUser()
    this.$bus.$emit('STATUS', 'Fetching stars...')
    await this.fetchUserStars()
    await this.fetchGitHubStars({ cursor: null, refresh: false })
    while (this.pageInfo.hasNextPage) {
      await this.fetchGitHubStars({
        cursor: this.pageInfo.endCursor,
        refresh: false
      })
    }
    // if (this.user.autotag_topics) {
    //   this.$bus.$emit('STATUS', 'Applying repository tags...')
    //   await this.autotagStars()
    // }
    this.$bus.$emit('STATUS', 'Cleaning up...')
    await this.cleanupStars()
    this.$bus.$emit('STATUS', '')
  },
  methods: {
    ...mapActions(['fetchUser', 'fetchGitHubStars', 'fetchUserStars', 'cleanupStars', 'autotagStars'])
  }
}
</script>
<style lang="scss">
.dashboard {
  display: grid;
  grid-template-columns: 280px 400px 1fr;
  grid-template-rows: 72px 64px 1fr;

  @media screen and (max-width: 767px) {
    grid-template-columns: 50px 400px 1fr;
  }
  header {
    grid-column: 1 / 4;
  }
  .sidebar {
    grid-column: 1 / 2;
    grid-row: 2 / 4;
    @media screen and (max-width: 767px) {
      position: fixed;
      z-index: 1;
      width: 50px;
      margin: 0px;
      padding: 0px;
      top: 70px;
      overflow: hidden;
      bottom: 0;
    }
  }

  .sidebar .navbar-burger {
    display: none;
    @media screen and (max-width: 767px) {
      display: block;
    }
  }

  .sidebar.open {
    @media screen and (max-width: 767px) {
      width: 100%;
      overflow-y: auto;
    }
  }

  .sidebar-inner {
    @media screen and (max-width: 767px) {
      visibility: hidden;
    }
  }

  .sidebar.open .sidebar-inner {
    @media screen and (max-width: 767px) {
      visibility: visible;
    }
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
