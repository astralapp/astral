import Vue from 'vue'
import vModal from 'vue-js-modal'
import App from './components/App'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(vModal, { componentName: 'VueModal' })

Object.defineProperty(Vue.prototype, '$bus', {
  get() {
    return this.$root.bus
  }
})

/* eslint-disable no-new */
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
