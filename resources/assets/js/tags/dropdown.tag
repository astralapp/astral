$ = require("jquery");
<dropdown>
  <div class="dropdown">
    <ul class="dropdown-list">
      <yield />
    </ul>
  </div>

  this.on("mount", () => {
    $("html").on("click", () => {
      $("dropdown").removeClass("active");
    });
    $(opts.trigger).on("click", (e) => {
      e.stopPropagation();
      $(this.root).toggleClass("active");
    });
  });

</dropdown>
