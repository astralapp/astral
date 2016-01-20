import Vue from "vue";
import Vuex from "vuex";
import * as actions from './actions.js'
import { userInitialState, userMutations } from "./modules/user.js";
import { githubStarsInitialState, githubStarsMutations } from "./modules/github.js";
import { starsInitialState, starsMutations } from "./modules/stars.js";
import { tagsInitialState, newTagInitialState, tagsMutations } from "./modules/tags.js";

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    user: userInitialState,
    githubStars: githubStarsInitialState,
    stars: starsInitialState,
    tags: tagsInitialState,
    newTag: newTagInitialState
  },
  actions,
  mutations: [userMutations, githubStarsMutations, tagsMutations, starsMutations]
});
