import {
  SET_STARS,
  CLEAR_STARS,
  SET_TOTAL_STARS,
  SET_STARS_PAGE_INFO
} from '../mutation-types'

import client from './../api/client.js'

const state = {
  stars: [],
  pageInfo: {},
  totalStars: 0
}

const getters = {
  stars: state => state.stars,
  pageInfo: state => state.pageInfo,
  totalStars: state => state.totalStars,
  languages: state => {
    return state.stars
      .map(star => {
        return star.node.primaryLanguage || null
      })
      .filter(Boolean)
      .map(repo => repo.name)
      .reduce((prev, cur) => {
        prev[cur] = (prev[cur] || 0) + 1
        return prev
      }, {})
  }
}

const mutations = {
  [SET_STARS](state, edges) {
    state.stars = state.stars.concat(edges)
  },
  [CLEAR_STARS](state) {
    state.stars = []
  },
  [SET_TOTAL_STARS](state, total) {
    state.totalStars = total
  },
  [SET_STARS_PAGE_INFO](state, info) {
    state.pageInfo = { ...info }
  }
}

const actions = {
  fetchGitHubStars({ commit }, cursor = null) {
    let url = '/api/stars/github'
    let data = cursor ? { cursor } : {}
    return client
      .withAuth()
      .post('/api/stars/github', data)
      .then(res => {
        commit(SET_STARS, res.edges)
        commit(SET_STARS_PAGE_INFO, res.pageInfo)
        if (!cursor) {
          commit(SET_TOTAL_STARS, res.totalCount)
        }
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
