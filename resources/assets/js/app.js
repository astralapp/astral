import Vue from "vue";
import VueRouter from "vue-router";
import App from "./components/app.vue";
import Auth from "./components/auth.vue";
import Dashboard from "./components/dashboard.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  hashbang: false,
  history: true
});

router.map({
  "/auth": {
    component: Auth
  },
  "/dashboard": {
    component: Dashboard
  }
});

router.redirect({
  "/": "/auth"
});

router.start(App, '#app')
