<dashboard>
  <div class="dashboard">
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
        <div class="dropdown" hide={true}>
          <ul class="dropdown-list">
            <li><a >Settings</a></li>
            <li><a href="mailto:hello@astralapp.com">Support &amp; Feedback</a></li>
            <li><a href="https://gratipay.com/syropian/" target="_blank"><i class="fa fa-heart"></i> Gratipay</a></li>
            <li><a ng-href="/logout">Sign Out</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="dashboard-main">
      <div class="dashboard-sidebar">
        <div class="dashboard-sidebar-header">
          <h3>Astral</h3>
        </div>
        <div class="sidebar-header">
          <h3 class="sidebar-header-text">Stars</h3>
        </div>
        <ul class="dashboard-list sidebar-stars">
          <li class="all-stars dashboard-list-item"><i class="fa fa-inbox"></i> All Stars</li>
          <li class="untagged-stars dashboard-list-item"><i class="fa fa-star-o"></i> Untagged Stars</li>
        </ul>
        <div class="sidebar-header tags-header">
          <h3 class="sidebar-header-text">Tags</h3>
          <div class="tag-button-group">
            <button class="tag-button-group-item">Add</button>
            <button class="tag-button-group-item">Edit</button>
            <button class="tag-button-group-item">Sort</button>
          </div>
        </div>
        <form class="tag-form" ng-show="addingTag" hide={true}>
          <input type="text" name="name" placeholder="Tag name">
          <button type="submit">Save</button>
        </form>
        <ul class="dashboard-list sidebar-tags">
          <li class="dashboard-list-item tag droppable">JavaScript</li>
        </ul>
      </div>
    </div>
  </div>

</dashboard>
