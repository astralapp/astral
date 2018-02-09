import Vue from 'vue'
import App from './components/App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$bus', {
  get() {
    return this.$root.bus
  }
})

const bus = new Vue({})

new Vue({
  el: '#app',
  data: {
    bus
  },
  router,
  store,
  render: h => h(App)
})
