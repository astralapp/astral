import { orderBy } from 'lodash'
import {
  ADD_TAG,
  ADD_TAG_ERROR,
  SET_TAGS,
  SET_CURRENT_TAG,
  SET_VIEWING_UNTAGGED,
  DELETE_TAG,
  DELETE_TAG_ERROR,
  UPDATE_TAG,
  SET_STAR_TAGS,
  UPDATE_TAG_ERROR
} from '../mutation-types'

import client from '@/store/api/client'
import router from '@/router'

const state = {
  tags: [],
  currentTag: {},
  errors: {
    add: [],
    delete: [],
    update: []
  }
}

const getters = {
  tags: state => state.tags,
  currentTag: state => state.currentTag,
  addTagErrors: state => state.errors.add,
  deleteTagErrors: state => state.errors.delete,
  updateTagErrors: state => state.errors.update
}

const mutations = {
  [SET_TAGS] (state, tags) {
    state.tags = tags
  },
  [SET_CURRENT_TAG] (state, tag) {
    state.currentTag = { ...tag }
  },
  [ADD_TAG] (state, tag) {
    state.tags = [...state.tags, ...[tag]]
    state.errors.delete = []
  },
  [ADD_TAG_ERROR] (state, errors) {
    state.errors.add = errors
  },
  [DELETE_TAG] (state, id) {
    const index = state.tags.findIndex(tag => {
      return tag.id === id
    })
    state.tags.splice(index, 1)
    state.errors.delete = []
  },
  [DELETE_TAG_ERROR] (state, errors) {
    state.errors.delete = errors
  },
  [UPDATE_TAG] (state, { id, newTag }) {
    state.tags = state.tags.map(tag => {
      if (tag.id === id) {
        tag = newTag
      }

      return tag
    })
    state.errors.update = []
  },
  [UPDATE_TAG_ERROR] (state, errors) {
    state.errors.update = errors
  }
}

const actions = {
  fetchTags ({ commit }) {
    return client
      .withAuth()
      .get('/api/tags')
      .then(res => {
        commit(SET_TAGS, res)
      })
  },
  addTag ({ commit }, name) {
    return client
      .withAuth()
      .post('/api/tags', { name })
      .then(res => {
        commit(ADD_TAG, res)
      })
  },
  setCurrentTag ({ commit }, tag) {
    if (Object.keys(tag).length) {
      commit(SET_VIEWING_UNTAGGED, false)
    }
    commit(SET_CURRENT_TAG, tag)
    router.replace({ query: { ...router.currentRoute.query, tag: tag.name } })
  },
  reorderTags ({ commit }, sortMap) {
    return client
      .withAuth()
      .put('/api/tags/reorder', { tags: sortMap })
      .then(res => {
        commit(SET_TAGS, res)
      })
  },
  sortTags ({ commit, state, dispatch }, method) {
    let sortedTags = []
    let sortMap = []

    switch (method) {
      case 'ALPHA_ASC':
        sortedTags = orderBy(state.tags, [tag => tag.name.toLowerCase()], ['asc'])
        break
      case 'ALPHA_DESC':
        sortedTags = orderBy(state.tags, [tag => tag.name.toLowerCase()], ['desc'])
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
  deleteTag ({ rootState, state, commit }, id) {
    client.withAuth().delete(`/api/tags/${id}`)
      .catch(error => {
        commit(DELETE_TAG_ERROR, error.errors.name)
      })

    if (state.currentTag.id === id) {
      commit(SET_CURRENT_TAG, {})
    }
    commit(DELETE_TAG, id)
    const starsWithTag = rootState.stars.stars
      .filter(star => {
        return star.tags.map(tag => tag.id).includes(id)
      })
      .map(star => {
        const filteredTags = star.tags.filter(tag => {
          return tag.id !== id
        })
        return { starId: star.node.databaseId, tags: filteredTags }
      })

    starsWithTag.forEach(star => {
      commit(SET_STAR_TAGS, star)
    })
  },
  renameTag ({ rootState, state, commit }, { id, name }) {
    client
      .withAuth()
      .patch(`/api/tags/${id}`, { name })
      .then(res => {
        if (state.currentTag.id === id) {
          commit(SET_CURRENT_TAG, res)
        }

        commit(UPDATE_TAG, { id, newTag: res })

        const starsWithTag = rootState.stars.stars
          .filter(star => {
            return star.tags.map(tag => tag.id).includes(id)
          })
          .map(star => {
            const tags = star.tags.map(tag => {
              if (tag.id === id) {
                tag.name = name
              }

              return tag
            })
            return { starId: star.node.databaseId, tags }
          })

        starsWithTag.forEach(star => {
          commit(SET_STAR_TAGS, star)
        })
      }).catch(error => {
        commit(UPDATE_TAG_ERROR, error.errors.name)
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
