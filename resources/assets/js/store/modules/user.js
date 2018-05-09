import ls from 'local-storage'
import { SET_USER, DELETE_USER } from '../mutation-types'
import client from '../api/client'
import router from '@/router'

const state = {
  user: {}
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => !!ls('jwt')
}

const mutations = {
  [SET_USER] (state, user) {
    state.user = user
  },
  [DELETE_USER] (state) {
    state.user = {}
  }
}

const actions = {
  fetchUser ({ commit }) {
    return client
      .withAuth()
      .get('/api/auth/me')
      .then(res => {
        commit(SET_USER, res)
      })
  },
  deleteUser ({ commit }, id) {
    return client
      .withAuth()
      .delete('/api/auth/delete', { id })
      .then(res => {
        commit(DELETE_USER, res)
        router.push('auth/logout')
        ls.clear()
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
