import { TOGGLE_COLLAPSED_STATE } from '../mutation-types'

const state = {
  collapsed: {
    tags: false,
    languages: false,
    filters: false
  }
}

const getters = {
  tagsCollapsed: state => state.collapsed.tags,
  languagesCollapsed: state => state.collapsed.languages,
  filtersCollapsed: state => state.collapsed.filters
}

const mutations = {
  [TOGGLE_COLLAPSED_STATE](state, key) {
    state.collapsed[key] = !state.collapsed[key]
  }
}

const actions = {
  toggleCollapsedState({ commit }, key) {
    commit(TOGGLE_COLLAPSED_STATE, key)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
