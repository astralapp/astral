import { mutations } from "../../../resources/assets/js/store/modules/stars.js";
const {
  SET_STARS,
  SET_CURRENT_STAR
} = mutations;

describe("Star Mutations", () => {
  it("can receive an array of stars", () => {
    const testStars = [
      {id: 1, repo_id: 1},
      {id: 2, repo_id: 2},
      {id: 3, repo_id: 3}
    ];
    const state = {};
    SET_STARS(state, testStars);
    expect(state.stars).toEqual(testStars);
  });
  it("can set the current star", () => {
    const star = {id: 1, repo_id: 1};
    const state = {};
    SET_CURRENT_STAR(state, star);
    expect(state.currentStar).toEqual(star);
  });
});
