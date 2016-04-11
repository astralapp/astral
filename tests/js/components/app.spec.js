describe("App Component", function () {
  var App = require("../../../resources/assets/js/components/app.vue");
  it("should have a name", function(){
    expect(App.name).toBe("App");
  });
  it("should have a Vuex store", function(){
    expect(App.hasOwnProperty("store")).toBe(true);
  });
  it("should have a router view in its template", function(){
    expect(App.template).toMatch("<router-view></router-view>")
  });
})
