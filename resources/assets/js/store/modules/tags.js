import { orderBy, omit } from 'lodash'
import { ADD_TAG, SET_TAGS, SET_CURRENT_TAG, DELETE_TAG, UPDATE_TAG, SET_STAR_TAGS } from '../mutation-types'

import client from '@/store/api/client'
import router from '@/router'

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
    state.currentTag = { ...tag }
  },
  [ADD_TAG](state, tag) {
    state.tags = [...state.tags, ...[tag]]
  },
  [DELETE_TAG](state, id) {
    const index = state.tags.findIndex(tag => {
      return tag.id === id
    })

    if (index > -1) {
      state.tags.splice(index, 1)
    }
  },
  [UPDATE_TAG](state, { id, newTag }) {
    state.tags = state.tags.map(tag => {
      if (tag.id === id) {
        tag = newTag
      }

      return tag
    })
  }
}

const actions = {
  fetchTags({ commit }) {
    return client.get('/tags').then(({ data }) => {
      commit(SET_TAGS, data)
    })
  },
  addTag({ commit }, name) {
    return client.post('/tags', { name }).then(({ data }) => {
      commit(ADD_TAG, data)
    })
  },
  setCurrentTag({ commit, dispatch }, tag) {
    commit(SET_CURRENT_TAG, tag)
    if (Object.keys(tag).length) {
      dispatch('setViewingUntagged', false)
      dispatch('setCurrentPredicate', {})
      router.replace({ query: { ...omit(router.currentRoute.query, 'predicate'), tag: tag.name } })
    } else {
      router.replace({ query: { ...omit(router.currentRoute.query, 'tag') } })
    }
  },
  reorderTags({ commit }, sortMap) {
    return client.put('/tags/reorder', { tags: sortMap }).then(({ data }) => {
      commit(SET_TAGS, data)
    })
  },
  sortTags({ commit, state, dispatch }, method) {
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
  deleteTag({ rootState, state, commit, dispatch }, id) {
    client.delete(`/tags/${id}`)

    if (state.currentTag.id === id) {
      dispatch('setCurrentTag', {})
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
  renameTag({ rootState, state, commit }, { id, name }) {
    return client.patch(`/tags/${id}`, { name }).then(({ data }) => {
      if (state.currentTag.id === id) {
        commit(SET_CURRENT_TAG, data)
        router.replace({ query: { ...router.currentRoute.query, tag: name } })
      }

      commit(UPDATE_TAG, { id, newTag: data })

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
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
