describe("the app tag", function(){
  var tag;
  var html;
  beforeEach(function(){
    html = document.createElement("app");
    document.body.appendChild(html);
    tag = riot.mount("app")[0];
  });
  afterEach(function(){
    tag.unmount();
  });
  it("mounts the app tag", function(){
    expect(tag.isMounted).toBe(true);
    expect( $("app").length ).toBe(1);
  });
});
