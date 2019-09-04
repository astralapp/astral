import { omit } from 'lodash'
import { SET_CURRENT_PREDICATE, SET_EDITING_PREDICATE, SET_PREDICATES, DELETE_PREDICATE } from '../mutation-types'
import client from '@/store/api/client'
import router from '@/router'

const state = {
  currentPredicate: {},
  editingPredicate: {},
  predicates: []
}

const getters = {
  currentPredicate: state => state.currentPredicate,
  editingPredicate: state => state.editingPredicate,
  predicates: state => state.predicates
}

const mutations = {
  [SET_CURRENT_PREDICATE](state, predicate) {
    state.currentPredicate = predicate
  },
  [SET_EDITING_PREDICATE](state, predicate) {
    state.editingPredicate = predicate
  },
  [SET_PREDICATES](state, predicates) {
    state.predicates = predicates
  },
  [DELETE_PREDICATE](state, id) {
    const index = state.predicates.findIndex(predicate => {
      return predicate.id === id
    })
    if (index > -1) {
      state.predicates.splice(index, 1)
    }
  }
}

const actions = {
  fetchPredicates({ commit }) {
    return client.get('/predicates').then(({ data }) => {
      commit(SET_PREDICATES, data)
    })
  },
  setCurrentPredicate({ commit, dispatch }, predicate) {
    commit(SET_CURRENT_PREDICATE, predicate)
    if (Object.keys(predicate).length) {
      dispatch('setViewingUntagged', false)
      dispatch('setCurrentTag', {})
      dispatch('setCurrentLanguage', '')
      router.replace({ query: { predicate: predicate.name } })
    } else {
      router.replace({ query: { ...omit(router.currentRoute.query, 'predicate') } })
    }
  },
  setEditingPredicate({ commit }, predicate) {
    commit(SET_EDITING_PREDICATE, predicate)
  },
  savePredicate({ dispatch, getters }, predicate) {
    const method = predicate.hasOwnProperty('id') ? 'patch' : 'post'

    return client[method]('/predicates', predicate).then(() => {
      return dispatch('fetchPredicates').then(() => {
        if (Object.keys(getters.currentPredicate).length) {
          return dispatch('setCurrentPredicate', getters.predicates.find(p => p.id === getters.currentPredicate.id))
        }
      })
    })
  },
  reorderPredicates({ commit }, sortMap) {
    return client.put('/predicates/reorder', { predicates: sortMap }).then(({ data }) => {
      commit(SET_PREDICATES, data)
    })
  },
  deletePredicate({ commit, dispatch, getters }, id) {
    client.delete(`/predicates/${id}`)
    if (Object.keys(getters.currentPredicate).length && getters.currentPredicate.id === id) {
      dispatch('setCurrentPredicate', {})
    }
    commit(DELETE_PREDICATE, id)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
