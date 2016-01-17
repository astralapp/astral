import Vue from "vue";
import VueResource from "vue-resource";
import Vuex from "vuex";
import ls from "local-storage";


Vue.use(VueResource);
Vue.use(Vuex);

const state = {
  stars: [],
  totalPages: 0,
  cachedPages: 0
};

const mutations = {
  SET_STARS(state, stars) {
    state.stars = stars;
  },
  SET_TOTAL_PAGES(state, count){
    state.totalPages = count;
  },
  SET_CACHED_PAGES(state, count){
    state.cachedPages = count;
  }
};

const actions = {
  fetchStars: function(store, page = 1) {
    let currentPage = page;
    let data = {};
    Vue.http.get(`/api/github/stars?page=${page}`, null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`,
        "Access-Token": ls("access_token")
      }
    }).then( (response) => {
      data = response.data.stars
      if(data.page_count) { store.dispatch("SET_TOTAL_PAGES", data.page_count); }
      if(data.cached) { store.dispatch("SET_CACHED_PAGES", data.cached); }
      if( store.state.cachedPages && store.state.cachedPages === store.state.totalPages ) {
        store.dispatch("SET_STARS", data.stars);
        return false
      }
      else {
        if(store.state.cachedPages){
          currentPage+= 1;
        } else {
          store.state.cachedPages++;
        }
      }
      if(currentPage <= store.state.totalPages) {
        store.dispatch("SET_STARS", data.stars);
        store.actions.fetchStars(currentPage);
      }
      else {
        store.dispatch("SET_STARS", data.stars);
      }
    });
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions
});
