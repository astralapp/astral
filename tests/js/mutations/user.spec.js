import { mutations } from "../../../resources/assets/js/store/modules/user.js";
const { SET_USER } = mutations;

describe("User Mutations", () => {
  it("should be able to set the user", function(){
    const testUser = {
      id: 1,
      username: "Syropian"
    }
    const state = {};
    SET_USER(state, testUser);
    expect(state.user).toEqual(testUser);
  });
});
