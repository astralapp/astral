import Vue from "vue";
import VueResource from "vue-resource";
import ls from "local-storage";
import * as types from "./mutation-types.js";

Vue.use(VueResource);

//User
export const fetchUser = ({ dispatch, state }) => {
  Vue.http.get("/api/auth/user", null, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_USER, response.data.message);
  });
};


//Github Stars
export const fetchGithubStars = ({ dispatch, state, actions }, page = 1) => {
  let promise = new Promise( (resolve, reject) => {
    let currentPage = page;
    let data = {};
    Vue.http.get(`/api/github/stars?page=${page}`, null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`,
        "Access-Token": ls("access_token")
      }
    }).then( (response) => {
      data = response.data.message;
      if(data.page_count) { dispatch(types.SET_TOTAL_PAGES, data.page_count); }
      if(data.cached) { dispatch(types.SET_CACHED_PAGES, data.cached); }
      if( state.github.cachedPages && state.github.cachedPages === state.github.totalPages ) {
        dispatch(types.SET_GITHUB_STARS, data.stars);
        resolve();
        return false
      }
      else {
        if(state.github.cachedPages){
          currentPage+= 1;
        } else {
          dispatch(types.INCREMENT_CACHED_PAGES)
        }
      }
      if(currentPage <= state.github.totalPages) {
        dispatch(types.SET_GITHUB_STARS, data.stars);
        fetchGithubStars({dispatch, state}, currentPage);
      }
      else {
        dispatch(types.SET_GITHUB_STARS, data.stars);
        resolve();
      }
    });
  });
  return promise;
};

export const fetchReadme = ({ dispatch }, name) => {
  let accessToken = ls("access_token");
  Vue.http.get(`https://api.github.com/repos/${name}/readme?access_token=${accessToken}`).then( (response) => {
    let readme  = atob(response.data.content);
    Vue.http.post(`https://api.github.com/markdown/raw?access_token=${accessToken}`, readme, {
      headers: {
        "Content-Type": "text/plain"
      }
    }).then( (response) => {
      let renderedReadme = response.data;
      dispatch(types.SET_README, renderedReadme);
    });
  });
};

export const setCurrentStar = ({ dispatch }, star) => {
  dispatch(types.SET_CURRENT_STAR, star);
}

//Tags
export const fetchTags = ({ dispatch }) => {
  let promise = new Promise( (resolve, reject) => {
    Vue.http.get("/api/tags", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      dispatch(types.SET_TAGS, response.data.message);
      resolve();
    });
  });
  return promise;
};

export const reorderTags = ({ dispatch }, sortMap) => {
  Vue.http.post("/api/tags/reorder", {"sortMap": sortMap}, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_TAGS, response.data.message);
  });
};

export const addTag = ({ dispatch, state }) => {
  Vue.http.post("/api/tags", state.tags.newTag, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_TAGS, response.data.message);
    dispatch(types.RESET_NEW_TAG);
  });
};

export const setCurrentTag = ({ dispatch }, tag) => {
  dispatch(types.SET_CURRENT_TAG, tag);
};

export const resetCurrentTag = ({ dispatch }) => {
  dispatch(types.RESET_CURRENT_TAG);
};

export const syncTags = ({ dispatch, state }, repo, tags) => {
  Vue.http.post("/api/stars/syncTags", {"star": repo, "tags": tags}, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    fetchGithubStars({dispatch, state});
    dispatch(types.SET_STARS, response.data.message);
    fetchTags({dispatch});
  });
};

export const editTagName = ({dispatch, state}, tagId, name) => {
  let promise = new Promise( (resolve, reject) => {
    Vue.http.put(`/api/tags/${tagId}`, {"name": name}, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      fetchGithubStars({dispatch, state});
      fetchStars({dispatch});
      dispatch(types.SET_TAGS, response.data.message.tags);
      setCurrentTag({dispatch}, response.data.message.tag);
      resolve(response.data.message.tag);
    });
  });
  return promise;
}


//Stars
export const tagStar = ({ dispatch, state }, starData) => {
  Vue.http.post("/api/stars/tag", starData, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    fetchGithubStars({dispatch, state});
    dispatch(types.SET_TAGS, response.data.message.tags);
    dispatch(types.SET_STARS, response.data.message.stars);
  });
};

export const fetchStars = ({ dispatch }) => {
  let promise = new Promise( (resolve, reject) => {
    Vue.http.get("/api/stars", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      dispatch(types.SET_STARS, response.data.message);
      resolve();
    });
  });
  return promise;
};

export const editStarNotes = ( {dispatch}, star, text) => {
  Vue.http.post("/api/stars/notes", {star: star, text: text}, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_STARS, response.data.message);
  });
};

//Misc.
export const setSearchQuery = ({ dispatch }, query) => {
  //Dispatch the original query as a string
  dispatch(types.SET_SEARCH_QUERY, query);

  //Tokenize the query
  let searchArray = query.split(":");
  let tags = searchArray.filter( (tag) => {
    return tag[0] === "#";
  }).map(( tag ) => {
    return tag.substring(1).toLowerCase();
  });
  let strings = searchArray.filter( (s) => {
    return s[0] !== "#";
  }).map( (s) => {
    return s.toLowerCase();
  });
  let languages = searchArray.filter( (s) => {
    return s[0] === "@"
  }).map( (s) => {
    return s.toLowerCase();
  });
  let tokenizedQuery = {
    "query": query,
    "tags": tags,
    "strings": strings,
    "languages": languages
  };
  dispatch(types.SET_TOKENIZED_SEARCH, tokenizedQuery);

};
