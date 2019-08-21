import {
  SET_CURRENT_PREDICATE,
  SET_EDITING_PREDICATE,
  SET_PREDICATES,
  SET_VIEWING_UNTAGGED,
  SET_CURRENT_LANGUAGE,
  SET_CURRENT_TAG
} from '../mutation-types'
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
  }
}

const actions = {
  fetchPredicates({ commit }) {
    return client
      .withAuth()
      .get('/predicates')
      .then(res => {
        commit(SET_PREDICATES, res)
      })
  },
  setCurrentPredicate({ commit }, predicate) {
    commit(SET_VIEWING_UNTAGGED, false)
    commit(SET_CURRENT_TAG, {})
    commit(SET_CURRENT_LANGUAGE, '')
    commit(SET_CURRENT_PREDICATE, predicate)
    router.replace({ query: { predicate: predicate.name } })
  },
  setEditingPredicate({ commit }, predicate) {
    commit(SET_EDITING_PREDICATE, predicate)
  },
  savePredicate({ dispatch, getters }, predicate) {
    const method = predicate.hasOwnProperty('id') ? 'patch' : 'post'

    return client
      .withAuth()
      [method]('/predicates', predicate)
      .then(() => {
        return dispatch('fetchPredicates').then(() => {
          if (Object.keys(getters.currentPredicate).length) {
            return dispatch('setCurrentPredicate', getters.predicates.find(p => p.id === getters.currentPredicate.id))
          }
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
