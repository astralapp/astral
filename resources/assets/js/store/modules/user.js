import { SET_USER, DELETE_USER } from '../mutation-types'
import client from '../api/client'
import router from '@/router'

const state = {
  user: {}
}

const getters = {
  user: state => state.user
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
    return client.get('/auth/me').then(({ data }) => {
      commit(SET_USER, data)
    })
  },
  deleteUser({ commit }) {
    return client.delete('/auth/delete').then(() => {
      commit(DELETE_USER)
      router.push('auth/logout')
    })
  },
  revokeUserAccess() {
    return client.get('/auth/revoke').then(() => {
      router.push('auth/logout')
    })
  },
  setShowLanguageTags({ commit }, flag) {
    return client.put('/user/show-language-tags', { flag }).then(({ data }) => {
      commit(SET_USER, data)
    })
  },
  setAutosaveNotes({ commit }, flag) {
    return client.put('/user/autosave-notes', { flag }).then(({ data }) => {
      commit(SET_USER, data)
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
