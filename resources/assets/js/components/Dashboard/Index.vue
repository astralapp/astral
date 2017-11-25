<template>
  <div class="dashboard w-screen h-screen overflow-hidden">
    <navbar></navbar>
    <sidebar></sidebar>
    <galileo></galileo>
    <star-list :stars="starsWithCurrentTag"></star-list>
    <div class="star-info bg-grey-lighter relative">
      <readme v-if="readme" :readme="readme"></readme>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Navbar from './Navbar'
import Sidebar from './Sidebar/'
import StarList from './StarList'
import Galileo from './Galileo'
import Readme from './Readme'
export default {
  name: 'Dashboard',
  components: {
    Galileo,
    Navbar,
    Readme,
    Sidebar,
    StarList
  },
  computed: {
    ...mapGetters(['user', 'stars', 'pageInfo', 'currentTag', 'readme']),
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
    ...mapActions(['fetchUser', 'fetchGitHubStars', 'fetchUserStars'])
  },
  async created() {
    await this.fetchUser()
    await this.fetchUserStars()
    await this.fetchGitHubStars()
    while (this.pageInfo.hasNextPage) {
      await this.fetchGitHubStars(this.pageInfo.endCursor)
    }
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

