import { Promise } from 'es6-promise'

import {
  APPEND_GITHUB_STARS,
  SET_GITHUB_STARS,
  SET_CURRENT_STAR,
  SET_REPO_TAGS,
  SET_REPO_NOTES,
  SET_TOTAL_PAGES,
  SET_CACHED_PAGES,
  INCREMENT_CACHED_PAGES,
  SET_README,
  REMOVE_TAG_FROM_STARS,
  EDIT_TAG_NAMES_ON_STARS,
  SET_TAGS
} from '../mutation-types.js'

import Stars from '../api/stars'

const state = {
  githubStars: [],
  currentStar: {},
  readme: '',
  totalPages: 0,
  cachedPages: 0
}

const getters = {
  githubStars: state => state.githubStars,
  currentStar: state => state.currentStar,
  readme: state => state.readme,
  totalPages: state => state.totalPages,
  cachedPages: state => state.cachedPages
}

export const mutations = {
  [APPEND_GITHUB_STARS] (state, stars) {
    state.githubStars = state.githubStars.concat(stars)
  },
  [SET_GITHUB_STARS] (state, stars) {
    state.githubStars = stars
  },
  [SET_CURRENT_STAR] (state, star) {
    state.currentStar = star
  },
  [SET_REPO_TAGS] (state, { id, tags }) {
    const repoIndex = state.githubStars.findIndex(repo => repo.id === id)
    state.githubStars[repoIndex].tags = tags
  },
  [SET_REPO_NOTES] (state, { id, notes }) {
    const repoIndex = state.githubStars.findIndex(repo => repo.id === id)
    state.githubStars[repoIndex].notes = notes
    state.currentStar.notes = notes
  },
  [SET_TOTAL_PAGES] (state, count) {
    state.totalPages = count
  },
  [SET_CACHED_PAGES] (state, count) {
    state.cachedPages = count
  },
  [INCREMENT_CACHED_PAGES] (state) {
    state.cachedPages++
  },
  [SET_README] (state, readme) {
    state.readme = readme
  },
  [REMOVE_TAG_FROM_STARS] (state, id) {
    state.githubStars = state.githubStars.map((star) => {
      if (star.tags && star.tags.length) {
        const tagIndex = star.tags.findIndex(tag => tag.id === id)
        if (tagIndex > -1) {
          star.tags.splice(tagIndex, 1)
        }
        return star
      } else {
        return star
      }
    })
  },
  [EDIT_TAG_NAMES_ON_STARS] (state, { id, newTag }) {
    state.githubStars = state.githubStars.map((star) => {
      if (star.tags && star.tags.length) {
        const tagIndex = star.tags.findIndex(tag => tag.id === id)
        if (tagIndex > -1) {
          star.tags[tagIndex] = newTag
        }
        return star
      } else {
        return star
      }
    })
  }
}

const actions = {
  fetchStars ({ commit, dispatch, state }, { page = 1, autotag = true, refresh = false } = {}) {
    return new Promise((resolve, reject) => {
      Stars.fetch(page, autotag, refresh).then((res) => {
        if (refresh) {
          commit(SET_GITHUB_STARS, [])
        }
        const data = res.message
        if (data.stars.page_count) {
          commit(SET_TOTAL_PAGES, data.stars.page_count)
        }
        if (data.stars.cached) {
          commit(SET_CACHED_PAGES, data.stars.cached)
        } else {
          commit(SET_CACHED_PAGES, 0)
        }
        if (state.cachedPages && state.cachedPages >= state.totalPages) {
          commit(SET_GITHUB_STARS, data.stars.stars)
          commit(SET_TAGS, data.tags)
          resolve(data.stars.stars)
        } else {
          commit(APPEND_GITHUB_STARS, data.stars.stars)
          commit(SET_TAGS, data.tags)
          if (state.cachedPages) {
            resolve(dispatch('fetchStars', { page: state.cachedPages + 1 }))
          } else {
            if (page < state.totalPages) {
              resolve(dispatch('fetchStars', { page: page + 1 }))
            } else {
              resolve(data.stars.stars)
            }
          }
        }
      }, (res) => {
        const headers = res.headers()
        const errorRes = { response: res, headers: headers }
        reject(JSON.stringify(errorRes))
      })
    })
  },
  fetchReadme ({ commit }, { name, accessToken }) {
    Stars.fetchReadme(name, accessToken).then((res) => {
      commit(SET_README, res)
    })
  },
  setCurrentStar ({ commit }, star) {
    commit(SET_CURRENT_STAR, star)
  },
  editStarNotes ({ commit }, { star, text }) {
    return new Promise((resolve, reject) => {
      Stars.editStarNotes(star, text).then((res) => {
        commit(SET_REPO_NOTES, { id: res.message.repo_id, notes: res.message.notes })
        resolve(res.message.notes)
      }, (res) => {
        reject(res)
      })
    })
  },
  tagStar ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      Stars.tagStar(data).then((res) => {
        commit(SET_TAGS, res.message.tags)
        commit(SET_REPO_TAGS, { id: res.message.star.repo_id, tags: res.message.star.tags })
        if (state.currentStar.id === data.repoId) {
          commit(SET_CURRENT_STAR, state.githubStars.find(repo => repo.id === res.message.star.repo_id))
        }
        resolve(res.message)
      }, (res) => {
        reject(res)
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
