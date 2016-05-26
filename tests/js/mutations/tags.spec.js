import { mutations } from "../../../resources/assets/js/store/modules/tags.js";
const {
  SET_NEW_TAG,
  SET_TAGS,
  RESET_NEW_TAG,
  SET_CURRENT_TAG,
  RESET_CURRENT_TAG
} = mutations;

describe("Tag Mutations", () => {
  it("can set content for a new tag", () => {
    const newTag = {
      name: "VueJS",
      description: "All things VueJS"
    }
    const state = {};
    SET_NEW_TAG(state, newTag);
    expect(state.newTag).toEqual(newTag);
  });
  it("can reset a new tag entry", () => {
    const currentTag = {
      name: "VueJS",
      description: "All things VueJS"
    }
    const state = { newTag: currentTag };
    RESET_NEW_TAG(state);
    expect(state.newTag).toEqual({name: "", description: ""});
  });
  it("can receive an array of tags", () => {
    const testTags = [
      {id: 1, name: "VueJS"},
      {id: 2, name: "Laravel"},
      {id: 3, name: "Gulp"},
    ]
    const state = {};
    SET_TAGS(state, testTags);
    expect(state.tags).toEqual(testTags);
  });
  it("can set the current tag", () => {
    const tag = {id: 1, name: "VueJS"};
    const state = {};
    SET_CURRENT_TAG(state, tag);
    expect(state.currentTag).toEqual(tag);
  });
  it("can reset the current tag", () => {
    const currentTag = {id: 1, name: "VueJS"};
    const state = { currentTag: currentTag }
    RESET_CURRENT_TAG(state);
    expect(state.currentTag).toEqual({});
  });
});
