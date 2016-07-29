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
        <label for="txtGitHubCloneURL" @click="focusCloneInput">Clone:</label>
        <input type="text" id="txtGitHubCloneURL" :value="star.ssh_url" @focus="focusCloneInput" readonly/>
      </div>
    </div>
    <!-- <div class="readme-loading-overlay" ng-show="readmeLoading">
      <spinner color="#658399"></spinner>
    </div> -->
    <div class="repo-readme syntax">
      {{{ readme }}}
    </div>
    <div>
      <star-notes-editor :notes="notes" v-if="star.hasOwnProperty('id') && noteEditorShowing"></star-notes-editor>
    </div>
  </div>
</template>
<script>
import { readme } from "../store/getters/githubGetters"
import { stars, currentStar } from "../store/getters/starsGetters"
import { tags } from "../store/getters/tagsGetters"
import { editStarNotes, syncTags } from "../store/actions"
import TagEditor from "./tag-editor.vue"
import StarNotesEditor from "./star-notes-editor.vue"

export default {
  name: "StarInfo",
  vuex: {
    getters: {
      readme: readme,
      stars: stars,
      star: currentStar,
      tags: tags
    },
    actions: {
      editStarNotes,
      sync: syncTags
    }
  },
  data () {
    return {
      tagEditorShowing: false,
      noteEditorShowing: false,
      currentNotes: ""
    }
  },
  computed: {
    notes () {
      if (this.userStar && this.userStar.hasOwnProperty("id")) {
        return this.userStar.notes
      } else {
        return ""
      }
    },
    userStar () {
      return this.stars.filter((star) => {
        return this.star.id === star.repo_id
      })[0]
    },
    tagList () {
      return this.tags.map((tag) => {
        let isSelected = false
        if (this.userStar && this.userStar.tags) {
          isSelected = this.userStar.tags.map(function (tag) {
            return tag.id
          }).indexOf(tag.id) > -1
        }
        return {
          id: tag.id,
          text: tag.name,
          selected: isSelected
        }
      })
    }
  },
  methods: {
    showTagEditor () { this.tagEditorShowing = true },
    hideTagEditor () { this.tagEditorShowing = false },
    syncTags (tags) {
      this.sync(this.star, tags).catch((errors) => {
        this.$root.$broadcast("NOTIFICATION", "There was an error saving these tags.", "error")
      })
      this.hideTagEditor()
    },
    saveNotes (notes) {
      this.editStarNotes(this.star, notes).catch((errors) => {
        this.$root.$broadcast("NOTIFICATION", "There was an error saving your notes for this star.", "error")
      })
    },
    focusCloneInput () {
      setTimeout(() => {
        document.getElementById("txtGitHubCloneURL").focus()
        document.getElementById("txtGitHubCloneURL").select()
      }, 0)
    }
  },
  events: {
    "SYNC_TAGS": function (tags) {
      this.syncTags(tags)
    },
    "NOTES_SAVED": function (notes) {
      this.saveNotes(notes)
    },
    "STAR_CHANGED": function () {
      this.noteEditorShowing = false
      this.$broadcast("STAR_CHANGED")
    }
  },
  components: {
    "tag-editor": TagEditor,
    "star-notes-editor": StarNotesEditor
  }
}
</script>
