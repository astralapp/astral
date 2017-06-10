import { Promise } from 'es6-promise'

import {
  ADD_TAG,
  SET_NEW_TAG,
  SET_TAGS,
  RESET_NEW_TAG,
  SET_TAG_FILTER,
  SET_CURRENT_TAG,
  SET_CURRENT_STAR,
  RESET_CURRENT_TAG,
  EDIT_TAG_NAMES_ON_STARS,
  SET_REPO_TAGS,
  REMOVE_TAG_FROM_STARS
} from '../mutation-types.js'

import Tags from '../api/tags'
import Stars from '../api/stars'

const state = {
  newTag: {
    name: '',
    description: ''
  },
  tags: [],
  currentTag: {},
  tagFilter: 'ALL'
}

const getters = {
  newTag: state => state.newTag,
  tags: state => state.tags,
  currentTag: state => state.currentTag,
  tagFilter: state => state.tagFilter
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
    state.newTag = Object.assign({}, state.newTag, { name: '', description: '' })
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

const actions = {
  fetchTags ({ commit }) {
    return new Promise((resolve, reject) => {
      Tags.fetch().then((res) => {
        commit(SET_TAGS, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  addTag ({ commit, state }) {
    return new Promise((resolve, reject) => {
      Tags.add(state.newTag).then((res) => {
        commit(ADD_TAG, res.message)
        commit(RESET_NEW_TAG)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  reorderTags ({ commit }, sortMap) {
    return new Promise((resolve, reject) => {
      Tags.reorder(sortMap).then((res) => {
        commit(SET_TAGS, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  syncTags ({ commit, rootState }, { repo, tags }) {
    return new Promise((resolve, reject) => {
      Tags.sync(repo, tags).then((res) => {
        commit(SET_CURRENT_STAR, rootState.github.githubStars.find(repo => repo.id === res.message.star.repo_id))
        commit(SET_REPO_TAGS, { id: res.message.star.repo_id, tags: res.message.star.tags })
        commit(SET_TAGS, res.message.tags)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  editTagName ({ commit }, { id, name }) {
    return new Promise((resolve, reject) => {
      Tags.edit(id, name).then((res) => {
        commit(SET_TAGS, res.message.tags)
        commit(SET_CURRENT_TAG, res.message.tag)
        setTimeout(() => {
          commit(EDIT_TAG_NAMES_ON_STARS, { id: id, newTag: res.message.tag })
          resolve(res.message.tag)
        }, 0)
      }, (res) => {
        reject(res)
      })
    })
  },
  deleteTag ({ commit }, id) {
    return new Promise((resolve, reject) => {
      Tags.delete(id).then((res) => {
        commit(REMOVE_TAG_FROM_STARS, id)
        commit(SET_TAGS, res.message)
        resolve(res.message)
      }, (res) => {
        reject(res)
      })
    })
  },
  setCurrentTag ({ commit }, tag) {
    commit(SET_CURRENT_TAG, tag)
  },
  setTagFilter ({ commit }, filter) {
    commit(SET_TAG_FILTER, filter)
  },
  resetCurrentTag ({ commit }) {
    commit(RESET_CURRENT_TAG)
  },
  cleanupStars ({ commit }) {
    return new Promise((resolve, reject) => {
      Stars.cleanup().then((res) => {
        commit(SET_TAGS, res.message.tags)
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
