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
        resolve("GITHUB_STARS_LOADED");
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
        resolve("GITHUB_STARS_LOADED");
      }
    });
  });
  return promise;
};

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


//Stars
export const tagStar = ({ dispatch }, starData) => {
  Vue.http.post("/api/stars/tag", starData, {
    headers: {
      "Authorization": `Bearer ${ls("jwt")}`
    }
  }).then( (response) => {
    dispatch(types.SET_TAGS, response.data.tags);
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
      resolve("GITHUB_STARS_LOADED");
    });
  });
  return promise;
};
