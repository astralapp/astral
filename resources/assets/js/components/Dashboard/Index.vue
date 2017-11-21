<template>
  <div class="dashboard w-screen h-screen overflow-hidden">
    <navbar></navbar>
    <sidebar></sidebar>
    <star-list :stars="stars"></star-list>
    <div class="star-info bg-grey-lighter relative"></div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Navbar from './Navbar'
import Sidebar from './Sidebar/'
import StarList from './StarList'
export default {
  name: 'Dashboard',
  components: {
    Navbar,
    Sidebar,
    StarList
  },
  computed: {
    ...mapGetters(['user', 'stars', 'pageInfo'])
  },
  methods: {
    ...mapActions(['fetchUser', 'fetchGitHubStars'])
  },
  async created() {
    await this.fetchUser()
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
  grid-template-rows: 72px 1fr;
  header {
    grid-column: 1 / 4;
  }
  .stars {
    grid-column: 2 / 3;
  }
  .star-info {
    grid-column: 3 / 4;
  }
}
</style>

