<template>
  <div class="dashboard-repo-details">
    <!-- <div class="empty-placeholder" v-show="star.hasOwnProperty('id') && !readme" v-show="!readme">No Readme For {{ star.full_name }}</div> -->
    <div class="empty-placeholder" v-show="!star.hasOwnProperty('id')">No Repo Selected</div>
    <div class="manage-star" v-if="star.hasOwnProperty('id')">
      <div class="edit-star-tags">
          <div class="dropdown-wrap">
            <button class="toggle-tag-editor" @click="toggleTagEditor"><i class="fa fa-tag"></i> Edit Tags</button>
            <tag-editor :tags.sync="tagList" :class="{'active': tagEditorShowing}" :placeholder="'Add a tag'"></tag-editor>
          </div>
      </div>
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
import TagEditor from "./tag-editor.vue";
export default {
  name: "StarInfo",
  data(){
    return {
      tagEditorShowing: false
    }
  },
  computed: {
    readme(){
      return store.state.readme;
    },
    star(){
      return store.state.currentStar;
    },
    userStar(){
      return store.state.stars.filter( (star) => {
        return this.star.id === star.repo_id;
      })[0];
    },
    tagList(){

      if(this.userStar && this.userStar.hasOwnProperty("tags")){
        return this.userStar.tags.map( (tag) => {
          return { name: tag.name }
        });
      }
      else {
        return [];
      }
    }
  },
  methods: {
    toggleTagEditor(){ return this.tagEditorShowing = !this.tagEditorShowing },
    showTagEditor(){ return this.tagEditorShowing = true },
    hideTagEditor(){ return this.tagEditorShowing = false },
    syncTags(tags){
      console.log(tags);
      // store.actions.syncTags(this.star, tags);
      // this.hideTagEditor();
    }
  },
  events: {
    "SYNC_TAGS": function(tags){
      this.syncTags(tags);
    }
  },
  ready(){
    // console.log(this.star);
  },
  components: {
    "tag-editor": TagEditor
  }
}
</script>
