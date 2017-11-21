<template>
  <div class="sidebar bg-black py-8 overflow-y-scroll">
    <sidebar-header title="Stars">
      <refresh-button :active="refreshingStars" @click.native="refreshStars"></refresh-button>
    </sidebar-header>
  </div>
</template>
<script>
import RefreshButton from './RefreshButton'
import SidebarHeader from './SidebarHeader'
export default {
  name: 'Sidebar',
  components: {
    RefreshButton,
    SidebarHeader
  },
  data() {
    return {
      refreshing: false
    }
  },
  methods: {
    refreshStars() {
      console.log('Refreshing Stars...')
    }
  }
}
</script>
