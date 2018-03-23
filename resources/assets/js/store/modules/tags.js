import { Promise } from 'es6-promise'
import { orderBy } from 'lodash'
import {
  ADD_TAG,
  SET_TAGS,
  SET_CURRENT_TAG,
  SET_VIEWING_UNTAGGED,
  DELETE_TAG,
  SET_STAR_TAGS
} from '../mutation-types'

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
  },
  [DELETE_TAG](state, id) {
    const index = state.tags.findIndex(tag => {
      return tag.id === id
    })
    state.tags.splice(index, 1)
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
  reorderTags({ commit }, sortMap) {
    return client
      .withAuth()
      .put('/api/tags/reorder', { tags: sortMap })
      .then(res => {
        commit(SET_TAGS, res)
      })
  },
  sortTags({ commit, state, dispatch }, method) {
    let sortedTags = []
    let sortMap = []

    switch (method) {
      case 'ALPHA_ASC':
        sortedTags = orderBy(state.tags, ['name'], ['asc'])
        break
      case 'ALPHA_DESC':
        sortedTags = orderBy(state.tags, ['name'], ['desc'])
        break
      case 'STARS_ASC':
        sortedTags = orderBy(state.tags, ['stars_count'], ['asc'])
        break
      case 'STARS_DESC':
        sortedTags = orderBy(state.tags, ['stars_count'], ['desc'])
        break
      default:
        sortedTags = orderBy(state.tags, ['sort_order'], ['asc'])
        break
    }

    commit(SET_TAGS, sortedTags)

    sortMap = sortedTags.map((tag, i) => {
      return {
        id: tag.id,
        sort_order: i
      }
    })

    dispatch('reorderTags', sortMap)
  },
  deleteTag({ rootState, state, commit }, id) {
    if (state.currentTag.id === id) {
      commit(SET_CURRENT_TAG, {})
    }
    commit(DELETE_TAG, id)
    const starsWithTag = rootState.stars.stars
      .filter(star => {
        return ~star.tags.map(tag => tag.id).indexOf(id)
      })
      .map(star => {
        const filteredTags = star.tags.filter(tag => {
          return tag.id !== id
        })
        return { starId: star.node.id, tags: filteredTags }
      })

    starsWithTag.forEach(star => {
      commit(SET_STAR_TAGS, star)
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
