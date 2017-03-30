import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import App from './components/app.vue'
import Auth from './components/auth.vue'
import Dashboard from './components/dashboard.vue'
import store from './store'

Vue.use(VueResource)
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/auth', component: Auth },
    { path: '/dashboard', component: Dashboard },
    { path: '/dashboard/untagged', component: Dashboard },
    { path: '/dashboard/tag/:tag', component: Dashboard },
    { path: '/', redirect: '/auth' }
  ]
})

Vue.http.interceptors.push({
  response (response) {
    if (response.status === 401) {
      window.location.href = '/api/auth'
    }
    return response
  }
})

Object.defineProperty(Vue.prototype, '$bus', {
  get () {
    return this.$root.bus
  }
})

const bus = new Vue({})

new Vue({
  el: '#app',
  router,
  store,
  data: { bus: bus },
  render: h => h(App)
})
