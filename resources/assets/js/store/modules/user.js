import { SET_USER } from '../mutation-types.js'

const state = {
  user: {}
}

const getters = {
  user: state => state.user
}

const mutations = {
  [SET_USER] (state, user) {
    state.user = user
  }
}

const actions = {
  fetchUser ({ commit }) => {
    const promise = new Promise((resolve, reject) => {
      Vue.http.get('/api/auth/user', null, {
        headers: {
          'Authorization': `Bearer ${ls('jwt')}`
        }
      }).then((response) => {
        commit(SET_USER, response.data.message)
        resolve(response.data.message)
      }, (response) => {
        reject(response)
      })
    })
    return promise
  }

  setUserAutoTag ({ commit }, prefState) => {
    const promise = new Promise((resolve, reject) => {
      Vue.http.post('/api/auth/user/autotag', { state: prefState }, {
        headers: {
          'Authorization': `Bearer ${ls('jwt')}`
        }
      }).then((response) => {
        commit(SET_USER, response.data.message)
        resolve(response.data.message)
      }, (response) => {
        reject(response.data)
      })
    })
    return promise
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
