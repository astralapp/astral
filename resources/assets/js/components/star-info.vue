<template>
  <div class="dashboard-repo-details">
    <div class="empty-placeholder" v-show="!star">No Repo Selected</div>
    <div class="empty-placeholder" v-show="star && !readme">No Readme For {{ star.full_name }}</div>
    <div class="manage-star">
      <!--<div class="edit-star-tags">
         <button class="toggle-tag-editor" ng-click="toggleTagEditor()"><i class="fa fa-tag"></i> Edit Tags</button>
        <div class="tags-dropdown" ng-show="addingTags" set-focus-if="addingTags">
          <tags-input ng-model="$parent.currentStarTags" display-property="name" resize="addingTags" min-length="1" replace-spaces-with-dashes="false" add-on-enter="false" add-on-blur="false">
            <auto-complete source="fetchTagsForAutoComplete($query)" min-length="1"></auto-complete>
          </tags-input>
          <button class="save-tags btn-flat" ng-click="syncTagsToStar()" trigger-on-enter="addingTags">Save Tags</button>
        </div>
      </div> -->
      <!-- <button class="unstar-repo" ng-click="unstarStar()"><i class="fa fa-star-o"></i> Unstar</button> -->
      <div class="clone-url">
        <label for="txtGitHubCloneURL">Clone:</label>
        <input type="text" id="txtGitHubCloneURL" :value="star.ssh_url" readonly/>
      </div>
    </div>
    <!-- <div class="readme-loading-overlay" ng-show="readmeLoading">
      <spinner color="#658399"></spinner>
    </div> -->
    <div class="repo-readme syntax">
      {{{ readme }}}
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import store from "../store/store.js";
export default {
  name: "StarInfo",
  computed: {
    readme(){ return store.state.readme; },
    star(){ return store.state.currentStar; }
  }
}
</script>
