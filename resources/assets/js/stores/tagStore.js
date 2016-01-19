import Vue from "vue";
import VueResource from "vue-resource";
import Vuex from "vuex";
import ls from "local-storage";


Vue.use(VueResource);
Vue.use(Vuex);

const state = {
  tags: [],
  newTag: {
    name: "",
    description: ""
  }
};

const mutations = {
  SET_NEW_TAG(state, tag){
    state.newTag = tag;
  },
  SET_TAGS(state, tags){
    state.tags = tags;
  },
  ADD_TAG(state, tag){
    state.tags.push(tag);
  },
  ADD_TAGS(state, tags){
    state.tags.concat(tags);
  },
  REMOVE_TAG(state, index){
    state.tags.splice(index, 1);
  }
};

const actions = {
  fetchTags: function(store){
    Vue.http.get("/api/tags", null, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      store.dispatch('SET_TAGS', response.data.tags);
    });
  },
  addTag: function(store) {
    Vue.http.post("/api/tags", store.state.newTag, {
      headers: {
        "Authorization": `Bearer ${ls("jwt")}`
      }
    }).then( (response) => {
      store.dispatch('ADD_TAG', response.data.tag);
      store.state.newTag.name = "";
      store.state.newTag.description = "";
    });
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions
});
