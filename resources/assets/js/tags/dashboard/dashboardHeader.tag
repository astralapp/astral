dropdown = require("../dropdown.tag")
<dashboard-header>
  <div class="dashboard-header">
    <h2>
      <span>All Stars</span>
    </h2>
    <div class="tag-settings-trigger">
      <i class="fa fa-cog"></i>
      <div class="dropdown" hide={true}>
        <form  class="frm-tagname">
          <input type="text">
          <button class="btn-flat" type="submit">Save</button>
        </form>
        <button class="btn-flat btn-danger">Delete Tag</button>
      </div>
    </div>
    <label for="galileo">
      <input type="text" id="galileo" class="telescope" placeholder="Gaze through your telescope">
      <i class="fa fa-search"></i>
    </label>
    <div class="user-dropdown-trigger">
      <img src="/images/avatar-sample.jpg" alt="Collin Henderson" class="user-avatar"/>
      <span class="user-username">syropian</span>
      <i class="fa fa-chevron-down"></i>
      <dropdown trigger=".user-dropdown-trigger">
    </div>
  </div>
</dashboard-header>
