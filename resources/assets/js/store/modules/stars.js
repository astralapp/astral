import {
  SET_STARS,
  SET_CURRENT_STAR
} from "../mutation-types.js";

export const starsInitialState = [];
export const currentStarInitialState = {};

export const starsMutations = {
  [SET_STARS] (state, stars) {
    state.stars = stars;
  },
  [SET_CURRENT_STAR] (state, star) {
    state.currentStar = star;
  },
};
