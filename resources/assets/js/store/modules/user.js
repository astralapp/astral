import Vue from 'vue'
import VueResource from 'vue-resource'
import ls from 'local-storage'
import { Promise } from 'es6-promise'
import { SET_USER } from '../mutation-types.js'

import user from '../api/user'

Vue.use(VueResource)

const state = {
  user: {}
}

const mutations = {
  [SET_USER] (state, user) {
    state.user = user
  }
}

const actions = {
  fetchUser ({ commit }) => {
    return new Promise(resolve, reject) => {
      user.fetch().then((res) => {
        commit(SET_USER, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    }
  },
  setUserAutoTag ({ commit }, state) => {
    return new Promise((resolve, reject) => {
      user.setAutoTag(state).then((res) => {
        commit(SET_USER, res.message)
        resolve(res.message)
      })
    }, (res) => {
      reject(res)
    })
  }
}

export default {
  state,
  actions,
  mutations
}
