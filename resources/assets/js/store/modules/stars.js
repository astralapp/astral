import qs from 'qs'
import { uniqBy, omit } from 'lodash'
import {
  CLEAR_STARS,
  ADD_TAG_TO_STARS,
  SET_CURRENT_LANGUAGE,
  SET_CURRENT_STAR,
  SELECT_STARS,
  PUSH_TO_CURRENT_STARS,
  SET_README,
  SET_README_LOADING,
  SET_STARS_PAGE_INFO,
  SET_STARS,
  SET_STAR_TAGS,
  SET_TAGS,
  SET_TOTAL_STARS,
  SET_USER_STARS,
  SET_VIEWING_UNTAGGED,
  MAP_USER_STARS_TO_GITHUB_STARS,
  SET_STAR_NOTES,
  RESET_STARS,
  UNSTAR_STAR
} from '../mutation-types'

import client from '@/store/api/client'
import router from '@/router'
import galileo from '@/filters/galileo'
import predicate from '@/filters/predicate'

const state = {
  userStars: [],
  stars: [],
  pageInfo: {},
  totalStars: 0,
  currentLanguage: '',
  currentStars: [],
  readme: '',
  readmeLoading: false,
  viewingUntagged: false
}

const getters = {
  stars: state => state.stars,
  filteredStars: (state, __getters, rootState) => {
    let stars
    if (Object.keys(rootState.predicates.currentPredicate).length) {
      stars = predicate(state.stars, JSON.parse(rootState.predicates.currentPredicate.body)).map(star => {
        return { type: 'star', value: star }
      })
    } else {
      stars = state.stars
        .filter(star => {
          if (!Object.keys(rootState.tags.currentTag).length) {
            return true
          } else {
            return star.tags.map(tag => tag.name).includes(rootState.tags.currentTag.name)
          }
        })
        .filter(star => {
          if (state.currentLanguage === '') {
            return true
          } else {
            return star.node.primaryLanguage && star.node.primaryLanguage.name === state.currentLanguage
          }
        })
        .filter(star => {
          if (!state.viewingUntagged) {
            return true
          }

          return !star.tags.length
        })
        .map(star => {
          return { type: 'star', value: star }
        })
    }

    return galileo(stars, rootState.galileo.tokenizedSearchQuery)
  },
  pageInfo: state => state.pageInfo,
  totalStars: state => state.totalStars,
  totalUntaggedStars: state => state.stars.filter(star => !star.tags.length).length,
  languages: state => {
    return Object.entries(
      state.stars
        .map(star => {
          return star.node.primaryLanguage || null
        })
        .filter(Boolean)
        .map(repo => repo.name)
        .reduce((totals, lang) => {
          return { ...totals, [lang]: (totals[lang] || 0) + 1 }
        }, {})
    )
      .map(entry => {
        return {
          name: entry[0],
          count: entry[1]
        }
      })
      .sort((a, b) => b.count - a.count)
  },
  currentLanguage: state => state.currentLanguage,
  currentStar: (__, getters) => (getters.currentStars.length > 0 ? getters.currentStars[0] : {}),
  currentStars: state => [...uniqBy(state.currentStars, 'node.databaseId')],
  currentStarIndexes: (state, getters) => {
    if (state.currentStars.length) {
      return [
        ...state.currentStars.map(star => {
          return getters.filteredStars.findIndex(s => s.value.node.databaseId === star.node.databaseId)
        })
      ]
    } else {
      return []
    }
  },
  readme: state => state.readme,
  readmeLoading: state => state.readmeLoading,
  viewingUntagged: state => state.viewingUntagged
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
  [ADD_TAG_TO_STARS](state, { stars, tag }) {
    stars.forEach(({ databaseId }) => {
      state.stars = state.stars.map(star => {
        let tags = star.tags
        if (star.node.databaseId === databaseId && !star.tags.map(tag => tag.name).includes(tag.name)) {
          tags = star.tags.concat([tag])
        }
        return { ...star, tags }
      })
    })
  },
  [SET_STAR_TAGS](state, { starId, tags }) {
    state.stars = state.stars.map(star => {
      if (star.node.databaseId === starId) {
        return { ...star, tags }
      } else {
        return star
      }
    })
  },
  [SET_USER_STARS](state, stars) {
    state.userStars = [...stars]
  },
  [MAP_USER_STARS_TO_GITHUB_STARS](state) {
    const userStars = state.userStars
    state.stars = state.stars.map(star => {
      let tags = []
      let notes = ''
      const userStar = userStars.find(s => s.repo_id === star.node.databaseId)
      if (userStar && (userStar.tags.length || userStar.notes)) {
        if (userStar.tags.length) {
          tags = userStar.tags
        }
        if (userStar.notes) {
          notes = userStar.notes
        }
      }

      return { ...star, tags, notes }
    })
  },
  [SET_CURRENT_STAR](state, star) {
    state.currentStars = [{ ...star }]
  },
  [PUSH_TO_CURRENT_STARS](state, star) {
    const starId = star.node.databaseId
    const starIndex = state.currentStars.findIndex(star => star.node.databaseId === starId)
    if (starIndex > -1) {
      state.currentStars.splice(starIndex, 1)
    } else {
      state.currentStars = state.currentStars.concat([star])
    }
  },
  [SELECT_STARS](state, stars) {
    state.currentStars = stars
  },
  [SET_README](state, readme) {
    state.readme = readme
  },
  [SET_README_LOADING](state, isLoading) {
    state.readmeLoading = isLoading
  },
  [SET_VIEWING_UNTAGGED](state, viewing) {
    state.viewingUntagged = viewing
  },
  [SET_STAR_NOTES](state, { id, notes = '' }) {
    state.stars = state.stars.map(star => {
      if (star.node.databaseId === id) {
        star = { ...star, notes }
      }

      return star
    })
    state.currentStars = [{ ...state.currentStars[0], notes }]
  },
  [RESET_STARS](state) {
    state.readme = ''
    state.pageInfo = {}
    state.totalStars = 0
    state.stars = []
    state.currentStars = []
  },
  [UNSTAR_STAR](state, databaseId) {
    state.stars = state.stars.filter(star => {
      return star.node.databaseId !== databaseId
    })
  }
}

const actions = {
  fetchGitHubStars({ commit }, { cursor = null, refresh = false }) {
    let cursorQs = cursor ? { cursor } : {}
    let refreshQs = refresh ? { refresh: true } : {}
    if (refresh) {
      commit(RESET_STARS)
    }
    return client.get(`/stars/github?${qs.stringify(cursorQs)}${qs.stringify(refreshQs)}`).then(({ data }) => {
      commit(
        SET_STARS,
        data.edges.map(edge => {
          edge.tags = []
          edge.notes = ''
          return edge
        })
      )
      commit(SET_STARS_PAGE_INFO, data.pageInfo)
      if (!cursor) {
        commit(SET_TOTAL_STARS, data.totalCount)
      }

      commit(MAP_USER_STARS_TO_GITHUB_STARS)
    })
  },
  fetchUserStars({ commit }) {
    client.get('/stars').then(({ data }) => {
      commit(SET_USER_STARS, data)
    })
  },
  setCurrentLanguage({ commit, dispatch }, language) {
    commit(SET_CURRENT_LANGUAGE, language)
    router.replace({
      query: {
        ...omit(router.currentRoute.query, 'predicate'),
        language: language || undefined
      }
    })
    if (language) {
      dispatch('setCurrentPredicate', {})
    }
  },
  addTagToStars({ commit }, data) {
    commit(ADD_TAG_TO_STARS, data)

    const { stars, tag } = data
    const starIds = stars.map(star => star.databaseId)
    client.post('/star/tags', { starIds, tag }).then(({ data }) => {
      commit(SET_TAGS, data.tags)
    })
  },
  setCurrentStar({ commit }, star) {
    commit(SET_CURRENT_STAR, star)
  },
  pushToCurrentStars({ commit }, star) {
    commit(PUSH_TO_CURRENT_STARS, star)
  },
  selectStars({ commit }, stars) {
    commit(SELECT_STARS, stars)
  },
  fetchReadme({ commit }, repoName) {
    commit(SET_README_LOADING, true)
    return client
      .get(`/stars/readme?repo=${repoName}`)
      .then(({ data }) => {
        commit(SET_README, data)
      })
      .catch(() => {
        commit(SET_README, '')
      })
      .finally(() => commit(SET_README_LOADING, false))
  },
  setViewingUntagged({ commit, dispatch }, viewing) {
    if (viewing) {
      dispatch('setCurrentTag', {})
      dispatch('setCurrentPredicate', {})
    }
    commit(SET_VIEWING_UNTAGGED, viewing)
  },
  syncStarTags({ commit }, { id, tags }) {
    client
      .put('/star/tags', {
        id,
        tags
      })
      .then(({ data }) => {
        commit(SET_TAGS, data.tags)
        commit(SET_STAR_TAGS, {
          starId: id,
          tags: data.star.tags
        })
      })
  },
  editStarNotes({ commit }, { id, notes }) {
    client
      .post('/star/notes', {
        id,
        notes
      })
      .then(() => {
        commit(SET_STAR_NOTES, {
          id,
          notes
        })
      })
  },
  cleanupStars({ commit }) {
    client.delete('/stars/cleanup').then(({ data }) => {
      commit(SET_USER_STARS, data)
      commit(MAP_USER_STARS_TO_GITHUB_STARS)
    })
  },
  autotagStars({ commit }) {
    client.put('/stars/autotag').then(({ data }) => {
      commit(SET_TAGS, data.tags)
      commit(SET_USER_STARS, data.stars)
      commit(MAP_USER_STARS_TO_GITHUB_STARS)
    })
  },
  unstarStar({ commit, state, dispatch, getters }, { databaseId, nodeId }) {
    commit(UNSTAR_STAR, databaseId)
    commit(SELECT_STARS, state.currentStars.filter(star => star.node.databaseId !== databaseId))
    if (Object.keys(getters.currentStar).length) {
      dispatch('fetchReadme', getters.currentStar.node.nameWithOwner)
    }

    client.delete('/stars/github/unstar', { databaseId, nodeId }).then(({ data }) => {
      commit(SET_TAGS, data.tags)
      commit(SET_USER_STARS, data.stars)
      commit(MAP_USER_STARS_TO_GITHUB_STARS)
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
