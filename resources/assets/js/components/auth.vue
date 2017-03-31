<template>
  <div class="auth">
    <div class="auth-authenticating" v-if="authenticating">
      <div class="auth-statusText">
        Signing In
      </div>
    <div class="auth-pulser"></div>
    </div>
    <div class="auth-signIn" v-else>
      <img src="/images/logo.svg" alt="Astral">
      <div class="auth-error" v-show="error != ''">{{ error }}</div>
      <a class="auth-signInButton" href="/api/auth" @click="authenticating = true">Sign In</a>
    </div>
  </div>
</template>
<script>
  import ls from 'local-storage'

  export default {
    name: 'Auth',
    data () {
      return {
        authenticating: false,
        error: ''
      }
    },
    beforeRouteEnter (to, from, next) {
      if (to.query.error) {
        next(vm => {
          vm.authenticating = false
          vm.error = 'Unable to authenticate user.'
        })
      } else {
        if (to.query.token) {
          ls('jwt', to.query.token)
          setTimeout(() => {
            next('/dashboard')
          }, 1)
        } else {
          next()
        }
      }
    }
  }
</script>
