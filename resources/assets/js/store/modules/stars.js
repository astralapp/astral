import {
  SET_STARS
} from "../mutation-types.js";

export const starsInitialState = [];

export const starsMutations = {
  [SET_STARS] (state, stars) {
    state.stars = stars;
  }
};
