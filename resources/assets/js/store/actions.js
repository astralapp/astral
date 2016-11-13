import Vue from "vue"
import VueResource from "vue-resource"
import ls from "local-storage"
import * as types from "./mutation-types.js"
import { Base64 } from "js-base64"

Vue.use(VueResource)

//  User
export const fetchUser = ({ dispatch, state }) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.get("/api/auth/user", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_USER, response.data.message)
      resolve(response.data.message)
    }, (response) => {
      reject(response)
    })
  })
  return promise
}

export const setUserAutoTag = ({ dispatch }, prefState) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.post("/api/auth/user/autotag", { state: prefState }, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_USER, response.data.message)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

//  Github Stars
export const fetchGithubStars = ({ dispatch, state, actions }, page = 1, autotag = 1, refresh = false) => {
  const promise = new Promise((resolve, reject) => {
    let data = {}
    const url = refresh ? `/api/github/stars/refresh` : `/api/github/stars?page=${page}&autotag=${autotag}`
    Vue.http.get(url, null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`,
        "Access-Token": ls("access_token")
      }
    }).then((response) => {
      if (refresh) {
        dispatch(types.SET_GITHUB_STARS, [])
      }
      data = response.data.message
      if (data.stars.page_count) {
        dispatch(types.SET_TOTAL_PAGES, data.stars.page_count)
      }

      if (data.stars.cached) {
        dispatch(types.SET_CACHED_PAGES, data.stars.cached)
      } else {
        dispatch(types.SET_CACHED_PAGES, 0)
      }

      // If the number of cached pages is equal to the total number of pages, we have all the stars cached, so we can just return them.
      if (state.github.cachedPages && state.github.cachedPages === state.github.totalPages) {
        dispatch(types.SET_GITHUB_STARS, data.stars.stars)
        resolve(data.stars.stars)
      } else {
        dispatch(types.APPEND_GITHUB_STARS, data.stars.stars)
        if (state.github.cachedPages) {
          resolve(fetchGithubStars({ dispatch, state }, (state.github.cachedPages + 1)))
        } else {
          if (page < state.github.totalPages) {
            resolve(fetchGithubStars({ dispatch, state }, (page + 1)))
          } else {
            resolve(data.stars.stars)
          }
        }
      }
    }, (response) => {
      const headers = response.headers()
      const res = Object.assign({}, { response: response, headers: headers })
      reject(JSON.stringify(res))
    })
  })
  return promise
}

export const fetchReadme = ({ dispatch }, name) => {
  const accessToken = ls("access_token")
  const promise = new Promise((resolve, reject) => {
    Vue.http.get(`https://api.github.com/repos/${name}/readme?access_token=${accessToken}`).then((response) => {
      let readme = Base64.decode(response.data.content)

      const branch = response.data.url.split('?ref=')[1]
      const regex = /(!\[.*\])\(\/?(?!(http:\/\/)|(https:\/\/)|(\/))(.*)\)/igm
      const replace_with = `$1(https://github.com/${name}/blob/${branch}/$5?raw=true)`

      readme = readme.replace(regex, replace_with)

      Vue.http.post(`https://api.github.com/markdown/raw?access_token=${accessToken}`, readme, {
        headers: {
          "Content-Type": "text/plain"
        }
      }).then((response) => {
        const renderedReadme = response.data
        dispatch(types.SET_README, renderedReadme)
        resolve(renderedReadme)
      })
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const setCurrentStar = ({ dispatch }, star) => {
  dispatch(types.SET_CURRENT_STAR, star)
}

//  Tags
export const fetchTags = ({ dispatch }) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.get("/api/tags", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_TAGS, response.data.message)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const reorderTags = ({ dispatch }, sortMap) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.post("/api/tags/reorder", { "sortMap": sortMap }, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_TAGS, response.data.message)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const addTag = ({ dispatch, state }) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.post("/api/tags", state.tags.newTag, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.ADD_TAG, response.data.message)
      dispatch(types.RESET_NEW_TAG)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const setCurrentTag = ({ dispatch }, tag) => {
  dispatch(types.SET_CURRENT_TAG, tag)
}

export const resetCurrentTag = ({ dispatch }) => {
  dispatch(types.RESET_CURRENT_TAG)
}

export const syncTags = ({ dispatch, state }, repo, tags) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.post("/api/stars/syncTags", { "star": repo, "tags": tags }, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_CURRENT_STAR, state.github.githubStars.find(repo => repo.id === response.data.message.star.repo_id))
      dispatch(types.SET_REPO_TAGS, response.data.message.star.repo_id, response.data.message.star.tags)
      dispatch(types.SET_TAGS, response.data.message.tags)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const setTagFilter = ({ dispatch }, filter) => {
  dispatch(types.SET_TAG_FILTER, filter)
}

export const editTagName = ({ dispatch, state }, tagId, name) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.put(`/api/tags/${tagId}`, { "name": name }, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_TAGS, response.data.message.tags)
      setCurrentTag({ dispatch }, response.data.message.tag)
      setTimeout(() => {
        dispatch(types.EDIT_TAG_NAMES_ON_STARS, tagId, response.data.message.tag)
        resolve(response.data.message.tag)
      }, 0)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const deleteTag = ({ dispatch, state }, tagId) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.delete(`/api/tags/${tagId}`, null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.REMOVE_TAG_FROM_STARS, tagId)
      dispatch(types.SET_TAGS, response.data.message)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

//  Stars
export const tagStar = ({ dispatch, state }, starData) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.post("/api/stars/tag", starData, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_CURRENT_STAR, state.github.githubStars.find(repo => repo.id === response.data.message.star.repo_id))
      dispatch(types.SET_TAGS, response.data.message.tags)
      dispatch(types.SET_REPO_TAGS, response.data.message.star.repo_id, response.data.message.star.tags)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

export const editStarNotes = ({ dispatch }, star, text) => {
  const promise = new Promise((resolve, reject) => {
    Vue.http.post("/api/stars/notes", { star: star, text: text }, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then((response) => {
      dispatch(types.SET_REPO_NOTES, response.data.message.repo_id, response.data.message.notes)
      resolve(response.data.message)
    }, (response) => {
      reject(response.data)
    })
  })
  return promise
}

//  Misc.
export const setSearchQuery = ({ dispatch }, query) => {
  //  Dispatch the original query as a string
  dispatch(types.SET_SEARCH_QUERY, query)

  //  Tokenize the query
  const searchArray = query.split(":")
  const tags = searchArray.filter((tag) => {
    return tag[0] === "#"
  }).map((tag) => {
    return tag.substring(1).toLowerCase()
  })
  const strings = searchArray.filter((s) => {
    return s[0] !== "#"
  }).map((s) => {
    return s.toLowerCase()
  })
  const tokenizedQuery = {
    "query": query,
    "tags": tags,
    "strings": strings
  }
  dispatch(types.SET_TOKENIZED_SEARCH, tokenizedQuery)
}
