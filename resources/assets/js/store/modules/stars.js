import {
  SET_STARS,
  CLEAR_STARS,
  SET_TOTAL_STARS,
  SET_STARS_PAGE_INFO,
  SET_CURRENT_LANGUAGE,
  PUSH_STAR_TAG,
  SET_TAGS,
  SET_USER_STARS,
  SYNC_STAR_TAGS,
  SET_CURRENT_STAR,
  SET_README
} from '../mutation-types'

import client from './../api/client.js'

const state = {
  userStars: [],
  stars: [],
  pageInfo: {},
  totalStars: 0,
  currentLanguage: '',
  currentStar: {},
  readme: ''
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
  },
  currentLanguage: state => state.currentLanguage,
  currentStar: state => state.currentStar,
  readme: state => state.readme
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
  },
  [SET_CURRENT_LANGUAGE](state, language) {
    state.currentLanguage = language
  },
  [PUSH_STAR_TAG](state, { starId, tag }) {
    state.stars = state.stars.map(star => {
      if (
        star.node.id === starId &&
        !star.tags.map(tag => tag.name).includes(tag.name)
      ) {
        star.tags.push(tag)
        return star
      } else {
        return star
      }
    })
  },
  [SET_USER_STARS](state, stars) {
    state.userStars = [].concat(stars)
  },
  [SYNC_STAR_TAGS](state) {
    const userStars = state.userStars
    state.stars.map(star => {
      const userStar = userStars.find(s => s.relay_id === star.node.id)
      if (userStar && userStar.tags.length) {
        star.tags = userStar.tags
        return star
      } else {
        return star
      }
    })
  },
  [SET_CURRENT_STAR](state, star) {
    state.currentStar = { ...star }
  },
  [SET_README](state, readme) {
    state.readme = readme
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
        commit(
          SET_STARS,
          res.edges.map(edge => {
            edge.tags = []
            return edge
          })
        )
        commit(SET_STARS_PAGE_INFO, res.pageInfo)
        if (!cursor) {
          commit(SET_TOTAL_STARS, res.totalCount)
        }
        commit(SYNC_STAR_TAGS)
      })
  },
  fetchUserStars({ commit }) {
    client
      .withAuth()
      .get('/api/stars')
      .then(res => {
        commit(SET_USER_STARS, res)
      })
  },
  setCurrentLanguage({ commit }, language) {
    commit(SET_CURRENT_LANGUAGE, language)
  },
  pushStarTag({ commit, rootState }, { starId, tag }) {
    commit(PUSH_STAR_TAG, { starId, tag })
    client
      .withAuth()
      .post('/api/star/tags', {
        relayId: starId,
        tagId: tag.id
      })
      .then(res => {
        commit(SET_TAGS, res.tags)
      })
  },
  setCurrentStar({ commit }, star) {
    commit(SET_CURRENT_STAR, star)
  },
  fetchReadme({ rootState, commit }, repoName) {
    const accessToken = rootState.user.user.access_token
    client
      .withoutAuth()
      .get(
        `https://api.github.com/repos/${repoName}/readme?access_token=${
          accessToken
        }`,
        {},
        {
          Accept: 'application/vnd.github.v3.html'
        }
      )
      .then(res => {
        commit(SET_README, res)
      })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
