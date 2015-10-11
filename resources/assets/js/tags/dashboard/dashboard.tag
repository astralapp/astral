dashboardHeader = require("./dashboardHeader.tag")
dashboardSidebar = require("./dashboardSidebar.tag")
starList = require("../stars/starList.tag")
dashboardRepoDetails = require("./dashboardRepoDetails.tag")
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
