<template>
  <div class="auth">
    <div class="auth-authenticated" v-if="authenticated">
      <div class="auth-statusText">
        Signing In
      </div>
      <div class="auth-pulser"></div>
    </div>
    <div class="auth-signIn" v-else>
      <img src="/images/logo.svg" alt="Astral">
      <div class="auth-error" v-show="error != ''">{{ error }}</div>
      <a class="auth-signInButton" href="/api/auth">Sign In</a>
    </div>
  </div>
</template>
<script>
  import ls from 'local-storage'

  export default {
    name: 'Auth',
    data () {
      return {
        authenticated: false,
        error: ''
      }
    },
    created() {
      if (this.$route.query.error) {
        this.authenticated = false
        this.error = 'Unable to authenticate user.'
      } else {
        if (this.$route.query.token && this.$route.query.access_token) {
          this.authenticated = true
          ls('jwt', this.$route.query.token)
          ls('access_token', this.$route.query.access_token)
          setTimeout(() => {
            this.$router.push('dashboard')
          }, 1)
        }
      }
    }
  }
</script>
