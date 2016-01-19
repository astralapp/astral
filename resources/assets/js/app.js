import Vue from "vue";
import VueRouter from "vue-router";
import VueResource from "vue-resource";
import App from "./components/app.vue";
import Auth from "./components/auth.vue";
import Dashboard from "./components/dashboard.vue";

Vue.use(VueResource);
Vue.use(VueRouter);

const router = new VueRouter({
  hashbang: false,
  history: true
});

router.map({
  "/auth": {
    name: "auth",
    component: Auth
  },
  "/dashboard": {
    name: "dashboard",
    component: Dashboard,
  }
});

router.redirect({
  "/": "/auth"
});

Vue.http.interceptors.push({
  response: function (response) {
    if(response.status === 401){
      window.location.href = "/api/auth";
    }
    return response;
  }
});

router.start(App, '#app')
