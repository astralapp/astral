import {
  SET_SEARCH_QUERY,
  SET_TOKENIZED_SEARCH
} from "../mutation-types.js";

export const searchInitialState = "";
export const tokenizedSearchInitialState = {
  query: "",
  tags: [],
  strings: [],
  languages: []
};


export const searchMutations = {
  [SET_SEARCH_QUERY] (state, query){
    state.searchQuery = query;
  },
  [SET_TOKENIZED_SEARCH] (state, obj){
    state.tokenizedSearchQuery = obj;
  }
}
