<template>
  <header class="bg-brand flex items-center px-8">
    <img
      class="block self-center h-8"
      src="/images/logo.svg">
    <user-dropdown/>
  </header>
</template>
<script>
import UserDropdown from '@/components/Dashboard/UserDropdown'
export default {
  name: 'Navbar',
  components: {
    UserDropdown
  }
}
</script>
