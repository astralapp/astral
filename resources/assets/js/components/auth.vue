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
        <button class="auth-signInButton" @click="authorize">Sign In</button>
    </div>
  </div>
</template>
<script>
  import ls from "local-storage";
  export default {
    name: "Auth",
    data() {
      return {
        authenticated: false
      }
    },
    methods: {
      authorize(){
        this.authenticated = true;
        const left = screen.availWidth / 2 - 400;
        const authPopup = window.open("/api/auth", "social_auth", `width=800,height=600,dialog,top=100,left=${left}`);
        authPopup.window.focus();
      },
      goToDashboard(){
        this.$route.router.go("/dashboard");
      }
    },
    ready() {
      window.goToDashboard = this.goToDashboard.bind(null);
    },
    route: {
      data({ to }){
        if(to.query.token && to.query.access_token){
          ls("jwt", to.query.token);
          ls("access_token", to.query.access_token);
          setTimeout(function(){
            window.opener.goToDashboard()
            window.close();
          }, 0);
        }
      }
    }
  }
</script>
