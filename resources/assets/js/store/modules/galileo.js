import {
  SET_SEARCH_QUERY,
  SET_TOKENIZED_SEARCH
} from "../mutation-types.js"

const state = {
  searchQuery: "",
  tokenizedSearchQuery: {
    query: "",
    tags: [],
    strings: [],
    languages: []
  }
}

export const mutations = {
  [SET_SEARCH_QUERY] (state, query) {
    state.searchQuery = query
  },
  [SET_TOKENIZED_SEARCH] (state, obj) {
    state.tokenizedSearchQuery = obj
  }
}

export default {
  state,
  mutations
}
