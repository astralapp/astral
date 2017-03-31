import { Promise } from 'es6-promise'

import { SET_USER } from '../mutation-types.js'
import user from '../api/user'

const state = {
  user: {}
}

const getters = {
  user: state => state.user
}

export const mutations = {
  [SET_USER] (state, user) {
    state.user = user
  }
}

const actions = {
  fetchUser ({ commit }) {
    return new Promise((resolve, reject) => {
      user.fetch().then((res) => {
        commit(SET_USER, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  setUserAutoTag ({ commit }, state) {
    return new Promise((resolve, reject) => {
      user.setAutoTag(state).then((res) => {
        commit(SET_USER, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  setUserSeenPatreonNotice ({ commit }) {
    return new Promise((resolve, reject) => {
      user.setSeenPatreonNotice().then((res) => {
        commit(SET_USER, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
