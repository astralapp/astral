describe("Auth Component", function () {
  var Auth = require("../../../resources/assets/js/components/auth.vue");
  it("should have a name", function(){
    expect(Auth.name).toBe("Auth");
  });
  it('should set correct default data', function () {
    expect(typeof Auth.data).toBe("function");
    var defaultData = Auth.data();
    expect(defaultData.authenticated).toBe(false);
  })
})
