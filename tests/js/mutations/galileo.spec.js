import { mutations } from "../../../resources/assets/js/store/modules/galileo.js";
const {
  SET_SEARCH_QUERY,
  SET_TOKENIZED_SEARCH
} = mutations;
describe("Galileo Mutations", () => {
  it("can set the search query", () => {
    const query = "#javascript:template";
    const state = {};
    SET_SEARCH_QUERY(state, query);
    expect(state.searchQuery).toBe(query);
  });
  it("can set the tokenized search query", () => {
    const tokenizedQuery = {
      query: "#javascript:template",
      tags: ["javascript"],
      strings: ["template"],
      languages: []
    };
    const state = {};
    SET_TOKENIZED_SEARCH(state, tokenizedQuery);
    expect(state.tokenizedSearchQuery).toEqual(tokenizedQuery);
  });
});
