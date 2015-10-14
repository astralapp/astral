require("./dashboardHeader.tag");
require("./dashboardSidebar.tag");
require("../stars/starList.tag");
require("./dashboardRepoDetails.tag");
<dashboard>
  <div class="dashboard">
    <dashboard-header />
    <div class="dashboard-main">
      <dashboard-sidebar />
      <star-list />
      <dashboard-repo-details />
    </div>
  </div>
</dashboard>
