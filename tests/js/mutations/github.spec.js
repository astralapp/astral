import { mutations } from "../../../resources/assets/js/store/modules/github.js";
const {
  SET_GITHUB_STARS,
  SET_TOTAL_PAGES,
  SET_CACHED_PAGES,
  INCREMENT_CACHED_PAGES,
  SET_README
} = mutations;

describe("GitHub Star Mutations", () => {
  it("can receive an array of GitHub stars", () => {
    const stars = [
      {id: 56919458, name: "vue-multiselect"},
      {id: 58734906, name: "vue-jwt-auth"},
      {id: 58905085, name: "bideo.js"},
    ];
    const state = {};
    SET_GITHUB_STARS(state, stars);
    expect(state.githubStars).toEqual(stars);
  });
  it("can set the total number of pages in the api pagination response", () => {
    const state = {};
    SET_TOTAL_PAGES(state, 5);
    expect(state.totalPages).toBe(5);
  });
  it("can set the number of cached pages from the server", () => {
    const state = {};
    SET_CACHED_PAGES(state, 3);
    expect(state.cachedPages).toBe(3);
  });
  it("can increment the number of cached pages", () => {
    const state = { cachedPages: 1 };
    INCREMENT_CACHED_PAGES(state);
    expect(state.cachedPages).toBe(2);
  });
  it("can set the readme text", () => {
    const readmeText = "This is a readme."
    const state = {};
    SET_README(state, readmeText);
    expect(state.readme).toBe(readmeText);
  });
});
