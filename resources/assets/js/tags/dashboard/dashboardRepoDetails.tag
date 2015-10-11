<dashboard-repo-details>
  <div class="dashboard-repo-details">
    <div class="empty-placeholder">No Repo Selected</div>
    <div class="empty-placeholder" hide={true}>No Readme For astralapp/astral</div>
    <div class="manage-star" hide={false}>
      <div class="edit-star-tags">
        <button class="toggle-tag-editor"><i class="fa fa-tag"></i> Edit Tags</button>
        <div class="tags-dropdown" hide={true}>
          <input type="text" value="" placeholder="Tags">
          <button class="save-tags btn-flat">Save Tags</button>
        </div>
      </div>
      <button class="unstar-repo"><i class="fa fa-star-o"></i> Unstar</button>
      <div class="clone-url">
        <label for="txtGitHubCloneURL">Clone:</label>
        <input type="text" id="txtGitHubCloneURL" value="http://github.com/astralapp/astral" readonly/>
      </div>
    </div>
    <div class="readme-loading-overlay" hide={true}>
      <spinner color="#658399"></spinner>
    </div>
    <div class="repo-readme syntax">
    </div>
  </div>
</dashboard-repo-details>
