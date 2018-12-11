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
  [SET_USER](state, user) {
    state.user = user
  },
  [DELETE_USER](state) {
    state.user = {}
  }
}

const actions = {
  fetchUser({ commit }) {
    return client
      .withAuth()
      .get('/api/auth/me')
      .then(res => {
        commit(SET_USER, res)
      })
  },
  deleteUser({ commit }) {
    return client
      .withAuth()
      .delete('/api/auth/delete')
      .then(res => {
        commit(DELETE_USER)
        router.push('auth/logout')
      })
  },
  revokeUserAccess({ commit }) {
    return client
      .withAuth()
      .get('/api/auth/revoke')
      .then(res => {
        router.push('auth/logout')
      })
  },
  setShowLanguageTags({ commit }, flag) {
    return client
      .withAuth()
      .put('/api/user/show-language-tags', { flag })
      .then(res => {
        commit(SET_USER, res)
      })
  },
  setAutosaveNotes({ commit }, flag) {
    return client
      .withAuth()
      .put('/api/user/autosave-notes', { flag })
      .then(res => {
        commit(SET_USER, res)
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
