describe("Dashboard Component", function () {
  var Dashboard = require("../../../resources/assets/js/components/dashboard.vue");
  it("should have a name", function(){
    expect(Dashboard.name).toBe("Dashboard");
  });
  it("should have Vuex access", function(){
    expect(Dashboard.hasOwnProperty("vuex")).toBe(true);
  });
})
