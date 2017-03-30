import {
  SET_SEARCH_QUERY,
  SET_TOKENIZED_SEARCH
} from '../mutation-types.js'

const state = {
  searchQuery: '',
  tokenizedSearchQuery: {
    query: '',
    tags: [],
    strings: [],
    languages: []
  }
}

const getters = {
  searchQuery: state => state.searchQuery,
  tokenizedSearchQuery: state => state.tokenizedSearchQuery
}

export const mutations = {
  [SET_SEARCH_QUERY] (state, query) {
    state.searchQuery = query
  },
  [SET_TOKENIZED_SEARCH] (state, obj) {
    state.tokenizedSearchQuery = obj
  }
}

const actions = {
  setSearchQuery ({ commit }, query) {
    commit(SET_SEARCH_QUERY, query)

    const searchArray = query.split(':')
    const tags = searchArray.filter((tag) => {
      return tag[0] === '#'
    }).map((tag) => {
      return tag.substring(1).toLowerCase()
    })
    const strings = searchArray.filter((s) => {
      return s[0] !== '#'
    }).map((s) => {
      return s.toLowerCase()
    })
    const tokenizedQuery = {
      'query': query,
      'tags': tags,
      'strings': strings
    }
    commit(SET_TOKENIZED_SEARCH, tokenizedQuery)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
