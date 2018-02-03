import { Promise } from 'es6-promise'
import { orderBy } from 'lodash'
import {
  ADD_TAG,
  SET_TAGS,
  SET_CURRENT_TAG,
  SET_TAG_SORT_METHOD,
  SET_VIEWING_UNTAGGED
} from '../mutation-types'

import client from './../api/client.js'

const state = {
  tags: [],
  currentTag: {},
  tagSortMethod: ''
}

const getters = {
  tags: state => state.tags,
  sortedTags: state => {
    const sortMethod = state.tagSortMethod
    if (!sortMethod) {
      return state.tags
    }

    switch (sortMethod) {
      case 'ALPHA_ASC':
        return orderBy(state.tags, ['name'], ['asc'])
        break
      case 'ALPHA_DESC':
        return orderBy(state.tags, ['name'], ['desc'])
        break
      case 'STARS_ASC':
        return orderBy(state.tags, ['stars_count'], ['asc'])
        break
      case 'STARS_DESC':
        return orderBy(state.tags, ['stars_count'], ['desc'])
        break
      default:
        return orderBy(state.tags, ['name'], ['asc'])
        break
    }
  },
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
  },
  [SET_TAG_SORT_METHOD](state, method) {
    state.tagSortMethod = method
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
    if (Object.keys(tag).length) {
      commit(SET_VIEWING_UNTAGGED, false)
    }
    commit(SET_CURRENT_TAG, tag)
  },
  sortTags({ commit }, method) {
    commit(SET_TAG_SORT_METHOD, method)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
