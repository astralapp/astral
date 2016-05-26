import { mutations } from "../../../resources/assets/js/store/modules/user.js";
const { SET_USER } = mutations;

describe("User Mutations", () => {
  it("can set the user", () => {
    const testUser = {
      id: 1,
      username: "Syropian"
    }
    const state = {};
    SET_USER(state, testUser);
    expect(state.user).toEqual(testUser);
  });
});
