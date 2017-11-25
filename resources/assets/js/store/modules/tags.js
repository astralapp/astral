import { Promise } from 'es6-promise'
import { ADD_TAG, SET_TAGS, SET_CURRENT_TAG } from '../mutation-types'

import client from './../api/client.js'

const state = {
  tags: [],
  currentTag: {}
}

const getters = {
  tags: state => state.tags,
  currentTag: state => state.currentTag
}

const mutations = {
  [SET_TAGS](state, tags) {
    state.tags = tags
  },
  [SET_CURRENT_TAG](state, tag) {
    state.currentTag = Object.assign({}, tag)
  },
  [ADD_TAG](state, tag) {
    state.tags = state.tags.concat([tag])
  }
}

const actions = {
  fetchTags({ commit }) {
    return client
      .withAuth()
      .get('/api/tags')
      .then(res => {
        commit(SET_TAGS, res)
      })
  },
  addTag({ commit }, name) {
    return client
      .withAuth()
      .post('/api/tags', { name })
      .then(res => {
        commit(ADD_TAG, res)
      })
  },
  setCurrentTag({ commit }, tag) {
    commit(SET_CURRENT_TAG, tag)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
