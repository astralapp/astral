<template>
  <header class="bg-brand flex items-center px-8">
    <img class="block self-center h-8 mr-16" src="/images/logo.svg" />
    <div v-show="!!status" class="flex items-center ml-6 text-white">
      <span>{{ status }}</span>
      <img src="/images/status-spinner.svg" alt="..." class="ml-2 spin" width="16" height="16" />
    </div>
    <UserDropdown />
  </header>
</template>
<script>
import UserDropdown from '@/components/dashboard/UserDropdown'
export default {
  name: 'Navbar',
  components: {
    UserDropdown
  },
  data() {
    return {
      status: ''
    }
  },
  mounted() {
    this.$bus.$on('STATUS', message => {
      this.status = message
    })
  }
}
</script>
