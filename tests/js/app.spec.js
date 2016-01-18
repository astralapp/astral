describe("App", function () {
  var App = require("../../resources/assets/js/components/app.vue");
  it("should have a name", function(){
    expect(App.name).toBe("App");
  });
  it("should have a router view in its template", function(){
    expect(App.template).toMatch("<router-view></router-view>")
  });
})
