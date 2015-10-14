const dashboardHeader = require("./dashboardHeader.tag")
const dashboardSidebar = require("./dashboardSidebar.tag")
const starList = require("../stars/starList.tag")
const dashboardRepoDetails = require("./dashboardRepoDetails.tag")
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
