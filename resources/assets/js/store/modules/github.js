import {
  SET_GITHUB_STARS,
  SET_TOTAL_PAGES,
  SET_CACHED_PAGES,
  INCREMENT_CACHED_PAGES
} from "../mutation-types.js";

export const githubStarsInitialState = [];

export const githubStarsMutations = {
  [SET_GITHUB_STARS] (state, stars) {
    state.githubStars = stars;
  },
  [SET_TOTAL_PAGES] (state, count){
    state.totalPages = count;
  },
  [SET_CACHED_PAGES] (state, count){
    state.cachedPages = count;
  },
  [INCREMENT_CACHED_PAGES] (state){
    state.cachedPages++;
  }
}
