import Vue from 'vue'
import App from './components/App'
import router from './router'
import store from './store'
import VueFeatherIcon from 'vue-feather-icon'
import VueSweetAlert from 'vue-sweetalert'

Vue.use(VueFeatherIcon)
Vue.use(VueSweetAlert)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
