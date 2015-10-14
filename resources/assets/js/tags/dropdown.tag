const $ = require("jquery")
<dropdown>
  <div class="dropdown">
    <ul class="dropdown-list">
      <yield />
    </ul>
  </div>

  self = this
  self.on("mount", => {
    $("html").on("click", => {
      $("dropdown").removeClass("active")
    });
    $(opts.trigger).on("click", (e) => {
      e.stopPropagation();
      $(self.root).toggleClass("active");
    });
  });
</dropdown>
