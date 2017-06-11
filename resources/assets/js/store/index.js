import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import user from './modules/user'
import github from './modules/github.js'
import tags from './modules/tags.js'
import galileo from './modules/galileo.js'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  modules: {
    user,
    github,
    tags,
    galileo
  }
})
