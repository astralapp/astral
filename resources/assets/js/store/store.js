import Vue from "vue";
import Vuex from "vuex";
import * as actions from './actions.js'
import { userInitialState, userMutations } from "./modules/user.js";
import { githubStarsInitialState, githubStarsMutations } from "./modules/github.js";
import { tagsInitialState, newTagInitialState, tagsMutations } from "./modules/tags.js";

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    user: userInitialState,
    githubStars: githubStarsInitialState,
    tags: tagsInitialState,
    newTag: newTagInitialState
  },
  actions,
  mutations: [userMutations, githubStarsMutations, tagsMutations]
});
