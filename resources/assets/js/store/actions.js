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
    }
  });
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

export const reorderTags = ({ dispatch, state }, sortMap) => {
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
