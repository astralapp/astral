import {
  SET_STARS,
  SET_CURRENT_STAR,
  SET_CURRENT_STAR_NOTES
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
  [SET_CURRENT_STAR_NOTES] (state, notes) {
    state.currentStar.notes = notes;
  }
};
