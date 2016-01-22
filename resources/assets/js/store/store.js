import Vue from "vue";
import Vuex from "vuex";
import * as actions from './actions.js'
import { userInitialState, userMutations } from "./modules/user.js";
import { githubStarsInitialState, readmeInitialState, githubStarsMutations } from "./modules/github.js";
import { starsInitialState, currentStarInitialState, starsMutations } from "./modules/stars.js";
import { tagsInitialState, newTagInitialState, currentTagInitialState, tagsMutations } from "./modules/tags.js";
import { searchInitialState, tokenizedSearchInitialState, searchMutations} from "./modules/galileo.js";

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    user: userInitialState,
    githubStars: githubStarsInitialState,
    stars: starsInitialState,
    tags: tagsInitialState,
    newTag: newTagInitialState,
    readme: readmeInitialState,
    currentStar: currentStarInitialState,
    currentTag: currentTagInitialState,
    searchQuery: searchInitialState,
    tokenizedSearchQuery: tokenizedSearchInitialState
  },
  actions,
  mutations: [userMutations, githubStarsMutations, tagsMutations, starsMutations, searchMutations]
});
