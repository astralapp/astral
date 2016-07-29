import {
  SET_GITHUB_STARS,
  SET_TOTAL_PAGES,
  SET_CACHED_PAGES,
  INCREMENT_CACHED_PAGES,
  SET_README
} from "../mutation-types.js"

const state = {
  githubStars: [],
  readme: "",
  totalPages: 0,
  cachedPages: 0
}

export const mutations = {
  [SET_GITHUB_STARS] (state, stars) {
    state.githubStars = stars
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
  }
}

export default {
  state,
  mutations
}
