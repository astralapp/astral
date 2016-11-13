import {
  ADD_TAG,
  SET_NEW_TAG,
  SET_TAGS,
  RESET_NEW_TAG,
  SET_TAG_FILTER,
  SET_CURRENT_TAG,
  RESET_CURRENT_TAG
} from "../mutation-types.js"

const state = {
  newTag: {
    name: "",
    description: ""
  },
  tags: [],
  currentTag: {},
  tagFilter: "ALL"
}

export const mutations = {
  [ADD_TAG] (state, tag) {
    state.tags = state.tags.concat([tag])
  },
  [SET_NEW_TAG] (state, tag) {
    state.newTag = Object.assign({}, state.newTag, tag)
  },
  [SET_TAGS] (state, tags) {
    state.tags = tags
  },
  [RESET_NEW_TAG] (state) {
    state.newTag = Object.assign({}, state.newTag, { name: "", description: "" })
  },
  [SET_TAG_FILTER] (state, filter) {
    state.tagFilter = filter
  },
  [SET_CURRENT_TAG] (state, tag) {
    state.currentTag = Object.assign({}, state.currentTag, tag)
  },
  [RESET_CURRENT_TAG] (state) {
    state.currentTag = {}
  }
}

export default {
  state,
  mutations
}
