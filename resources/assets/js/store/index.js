import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import localForage from 'localforage'
import user from './modules/user'
import stars from './modules/stars'
import tags from './modules/tags'
import galileo from './modules/galileo'
import ui from './modules/ui'
import predicates from './modules/predicates'

Vue.use(Vuex)

const vuexPersistence = new VuexPersistence({
  storage: localForage,
  asyncStorage: true,
  reducer(state) {
    return {
      user: {
        user: { ...state.user.user }
      },
      tags: {
        tags: [...state.tags.tags]
      },
      ui: state.ui,
      stars: {
        userStars: [...state.stars.userStars],
        stars: [...state.stars.stars],
        pageInfo: { ...state.stars.pageInfo },
        totalStars: state.stars.totalStars
      }
    }
  }
})

export default new Vuex.Store({
  modules: {
    user,
    stars,
    tags,
    galileo,
    ui,
    predicates
  },
  plugins: [vuexPersistence.plugin]
})
