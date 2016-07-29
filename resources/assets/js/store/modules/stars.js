import {
  SET_STARS,
  SET_CURRENT_STAR
} from "../mutation-types.js"

const state = {
  stars: [],
  currentStar: {}
}

export const mutations = {
  [SET_STARS] (state, stars) {
    state.stars = stars
  },
  [SET_CURRENT_STAR] (state, star) {
    state.currentStar = star
  }
}

export default {
  state,
  mutations
}
