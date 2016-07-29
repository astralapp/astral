import { SET_USER } from "../mutation-types.js"

const state = {
  user: {}
}

export const mutations = {
  [SET_USER] (state, user) {
    state.user = user
  }
}

export default {
  state,
  mutations
}
