import Vue from "vue";
import VueResource from "vue-resource";
import ls from "local-storage";
import marked from "marked";
import * as types from "./mutation-types.js";

Vue.use(VueResource);

//User
export const fetchUser = ({ dispatch, state }) => {
  Vue.http.get("/api/auth/user", null, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_USER, response.data.user);
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
      data = response.data.stars
      if(data.page_count) { dispatch(types.SET_TOTAL_PAGES, data.page_count); }
      if(data.cached) { dispatch(types.SET_CACHED_PAGES, data.cached); }
      if( state.cachedPages && state.cachedPages === state.totalPages ) {
        dispatch(types.SET_GITHUB_STARS, data.stars);
        resolve();
        return false
      }
      else {
        if(state.cachedPages){
          currentPage+= 1;
        } else {
          dispatch(types.INCREMENT_CACHED_PAGES)
        }
      }
      if(currentPage <= state.totalPages) {
        dispatch(types.SET_GITHUB_STARS, data.stars);
        actions.fetchGithubStars(currentPage);
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
    let readme = marked( window.atob(response.data.content) );
    dispatch(types.SET_README, readme);
  });
};

export const setCurrentStar = ({ dispatch }, star) => {
  dispatch(types.SET_CURRENT_STAR, star);
}


//Tags
export const fetchTags = ({ dispatch }) => {
  Vue.http.get("/api/tags", null, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_TAGS, response.data.tags);
  });
};

export const reorderTags = ({ dispatch }, sortMap) => {
  Vue.http.post("/api/tags/reorder", {"sortMap": sortMap}, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_TAGS, response.data.tags);
  });
};

export const addTag = ({ dispatch, state }) => {
  Vue.http.post("/api/tags", state.newTag, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.ADD_TAG, response.data.tag);
    dispatch(types.RESET_NEW_TAG);
  });
};

export const setCurrentTag = ({ dispatch }, tag) => {
  dispatch(types.SET_CURRENT_TAG, tag);
};

export const resetCurrentTag = ({ dispatch }) => {
  dispatch(types.RESET_CURRENT_TAG);
};


//Stars
export const tagStar = ({ dispatch }, starData) => {
  Vue.http.post("/api/stars/tag", starData, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_TAGS, response.data.tags);
    dispatch(types.SET_STARS, response.data.stars);
  });
};

export const fetchStars = ({ dispatch }) => {
  let promise = new Promise( (resolve, reject) => {
    Vue.http.get("/api/stars", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      dispatch(types.SET_STARS, response.data.stars);
      resolve();
    });
  });
  return promise;
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
    return tag.substring(1);
  });
  let strings = searchArray.filter( (tag) => {
    return tag[0] !== "#";
  });
  let tokenizedQuery = {
    "query": query,
    "tags": tags,
    "strings": strings
  };
  dispatch(types.SET_TOKENIZED_SEARCH, tokenizedQuery);

};
