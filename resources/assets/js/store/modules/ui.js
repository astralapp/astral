import { TOGGLE_COLLAPSED_STATE } from '../mutation-types'

const state = {
  collapsed: {
    tags: JSON.parse(localStorage.getItem('astral_ui_collapsed_tags')) || false,
    languages: JSON.parse(localStorage.getItem('astral_ui_collapsed_languages')) || false,
    filters: JSON.parse(localStorage.getItem('astral_ui_collapsed_filters')) || false
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
  toggleCollapsedState({ commit, state }, key) {
    commit(TOGGLE_COLLAPSED_STATE, key)
    localStorage.setItem(`astral_ui_collapsed_${key}`, state.collapsed[key])
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
