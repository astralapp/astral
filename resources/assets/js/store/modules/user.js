import { SET_USER } from "../mutation-types.js";

export const userInitialState = {};

export const userMutations = {
  [SET_USER] (state, user) {
    state.user = user;
  }
};
