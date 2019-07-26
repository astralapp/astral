import {
  SET_CURRENT_PREDICATE,
  SET_PREDICATES,
  SET_VIEWING_UNTAGGED,
  SET_CURRENT_LANGUAGE,
  SET_CURRENT_TAG
} from '../mutation-types'
import client from '@/store/api/client'
import router from '@/router'

const state = {
  currentPredicate: {},
  predicates: []
}

const getters = {
  currentPredicate: state => state.currentPredicate,
  predicates: state => state.predicates
}

const mutations = {
  [SET_CURRENT_PREDICATE](state, predicate) {
    state.currentPredicate = predicate
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
  saveCurrentPredicate({ commit }, predicate) {
    return client
      .withAuth()
      .post('/predicates', predicate)
      .then(res => {
        commit(SET_CURRENT_PREDICATE, JSON.parse(res))
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
