<template>
  <div class="auth">
    <div class="auth-authenticated" v-show="authenticated">
      <div class="auth-statusText">
        Signing In
      </div>
      <div class="auth-pulser"></div>
    </div>
    <div class="auth-signIn" v-else>
      <img src="images/logo.svg" alt="Astral">
        <div class="auth-error" v-show="error != ''">{{ error }}</div>
        <a class="auth-signInButton" href="/api/auth">Sign In</a>
    </div>
  </div>
</template>
<script>
  import ls from "local-storage"
  export default {
    name: "Auth",
    data() {
      return {
        authenticated: false,
        error: ""
      }
    },
    route: {
      data({ to }){
        if(to.query.error){
          this.authenticated = false
          this.error = "Unable to authenticate user."
        } else {
          if(to.query.token && to.query.access_token){
            this.authenticated = true
            ls("jwt", to.query.token)
            ls("access_token", to.query.access_token)
            setTimeout( () => {
              this.$route.router.go("/dashboard")
            }, 1)
          }
        }
      }
    }
  }
</script>
