import Vue from "vue";
import VueResource from "vue-resource";
import Vuex from "vuex";
import ls from "local-storage";


Vue.use(VueResource);
Vue.use(Vuex);

const state = {
  user: {},
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  }
};

const actions = {
  fetchUser: function(store) {
    Vue.http.get("/api/auth/user", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      store.dispatch('SET_USER', response.data.user);
    });
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions
});
