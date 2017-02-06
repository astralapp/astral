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
  EDIT_TAG_NAMES_ON_STARS
} from "../mutation-types.js"

const state = {
  githubStars: [],
  currentStar: {},
  readme: "",
  totalPages: 0,
  cachedPages: 0
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
  [SET_REPO_TAGS] (state, id, tags) {
    const repoIndex = state.githubStars.findIndex(repo => repo.id === id)
    state.githubStars[repoIndex].tags = tags
  },
  [SET_REPO_NOTES] (state, id, notes) {
    const repoIndex = state.githubStars.findIndex(repo => repo.id === id)
    state.githubStars[repoIndex].notes = notes
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
  [EDIT_TAG_NAMES_ON_STARS] (state, id, newTag) {
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

export default {
  state,
  mutations
}
