import {
  SET_NEW_TAG,
  SET_TAGS,
  ADD_TAGS,
  ADD_TAG,
  REMOVE_TAG,
  RESET_NEW_TAG
} from "../mutation-types.js";

export const tagsInitialState = [];
export const newTagInitialState = {
  name: "",
  description: ""
};

export const tagsMutations = {
  [SET_NEW_TAG] (state, tag){
    state.newTag = tag;
  },
  [SET_TAGS] (state, tags){
    state.tags = tags;
  },
  [ADD_TAG] (state, tag){
    state.tags.push(tag);
  },
  [ADD_TAGS] (state, tags){
    state.tags.concat(tags);
  },
  [REMOVE_TAG] (state, index){
    state.tags.splice(index, 1);
  },
  [RESET_NEW_TAG] (state){
    state.newTag.name = "";
    state.newTag.description = "";
  }
}
