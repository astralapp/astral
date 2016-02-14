<template>
  <div class="dashboard-repo-details">
    <!-- <div class="empty-placeholder" v-show="star.hasOwnProperty('id') && !readme" v-show="!readme">No Readme For {{ star.full_name }}</div> -->
    <div class="empty-placeholder" v-show="!star.hasOwnProperty('id')">No Repo Selected</div>
    <div class="manage-star" v-if="star.hasOwnProperty('id')">
      <div class="edit-star-tags">
          <div class="dropdown-wrap">
            <button class="toggle-tag-editor" @click="tagEditorShowing = !tagEditorShowing"><i class="fa fa-tag"></i> Edit Tags</button>
            <div>
              <tag-editor :tags="tagList" :class="{'active': tagEditorShowing}"></tag-editor>
            </div>
          </div>
      </div>
      <button class="toggle-tag-editor" @click="noteEditorShowing = !noteEditorShowing"><i class="fa fa-sticky-note"></i> Notes</button>
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
    <div>
      <star-notes-editor :notes="notes" v-show="star.hasOwnProperty('id') && noteEditorShowing"></star-notes-editor>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import store from "../store/store.js";
import TagEditor from "./tag-editor.vue";
import StarNotesEditor from "./star-notes-editor.vue";
export default {
  name: "StarInfo",
  data(){
    return {
      tagEditorShowing: false,
      noteEditorShowing: false,
      currentNotes: ""
    }
  },
  computed: {
    readme(){
      return store.state.readme;
    },
    star(){
      return store.state.currentStar;
    },
    notes(){
      if( this.userStar && this.userStar.hasOwnProperty("id") ){
        return this.userStar.notes;
      }
      else {
        return "";
      }
    },
    userStar(){
      return store.state.stars.filter( (star) => {
        return this.star.id === star.repo_id;
      })[0];
    },
    tags(){
      return store.state.tags;
    },
    tagList(){
      return this.tags.map( (tag) => {
        let isSelected = false;
        if( this.userStar && this.userStar.tags ){
          isSelected = this.userStar.tags.map(function(tag){
            return tag.id;
          }).indexOf(tag.id) > -1;
        }
        return {
          id: tag.id,
          text: tag.name,
          selected: isSelected
        }
      });
    }
  },
  methods: {
    showTagEditor(){ return this.tagEditorShowing = true },
    hideTagEditor(){ return this.tagEditorShowing = false },
    syncTags(tags){
      store.actions.syncTags(this.star, tags);
      this.hideTagEditor();
    },
    saveNotes(notes){
      store.actions.editStarNotes(this.star, notes);
    }
  },
  events: {
    "SYNC_TAGS": function(tags){
      this.syncTags(tags);
    },
    "NOTES_SAVED": function(notes){
      this.saveNotes(notes);
    }
  },
  ready(){
  },
  components: {
    "tag-editor": TagEditor,
    "star-notes-editor": StarNotesEditor
  }
}
</script>
