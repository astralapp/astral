<template>
  <div class="dashboard-repo-details">
    <div class="empty-placeholder" v-show="!currentStar.hasOwnProperty('id')">No Repo Selected</div>
    <div class="manage-star" v-if="currentStar.hasOwnProperty('id')">
      <div class="edit-star-tags">
          <div class="dropdown-wrap">
            <button class="toggle-tag-editor" @click="tagEditorShowing = !tagEditorShowing"><i class="fa fa-tag"></i> Edit Tags</button>
            <div>
              <tag-editor :tags="tagList" :class="{'active': tagEditorShowing}" v-on-clickaway="clickedAwayFromTagEditor"></tag-editor>
            </div>
          </div>
      </div>
      <button class="toggle-notes-editor" @click="noteEditorShowing = !noteEditorShowing"><i class="fa fa-sticky-note"></i> Notes</button>
      <div class="clone-url">
        <label for="txtGitHubCloneURL" @click="focusCloneInput">Clone:</label>
        <input type="text" id="txtGitHubCloneURL" :value="currentStar.ssh_url" @focus="focusCloneInput" readonly/>
      </div>
    </div>
    <div class="readme-error-overlay" :class="{ 'active': readmeError }">
      Error Loading Readme
    </div>
    <div class="readme-notfound-overlay" :class="{ 'active': readmeNotFound }">
      Readme not found
    </div>
    <div class="readme-loading-overlay" :class="{ 'active': readmeLoading }">
      <img src="/images/loader1.svg" />
    </div>
    <div class="repo-readme syntax" v-html="readme"></div>
    <div>
      <star-notes-editor :notes="notes" v-if="currentStar.hasOwnProperty('id') && noteEditorShowing"></star-notes-editor>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import TagEditor from './tag-editor.vue'
import StarNotesEditor from './star-notes-editor.vue'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  name: 'StarInfo',
  mixins: [clickaway],
  components: {
    'tag-editor': TagEditor,
    'star-notes-editor': StarNotesEditor
  },
  data () {
    return {
      tagEditorShowing: false,
      noteEditorShowing: false,
      readmeLoading: false,
      readmeError: false,
      readmeNotFound: false,
      currentNotes: ''
    }
  },
  computed: {
    ...mapGetters([
      'readme',
      'currentStar',
      'tags',
      'user'
    ]),
    notes () {
      if (this.currentStar && this.currentStar.hasOwnProperty('id')) {
        return this.currentStar.notes
      } else {
        return ''
      }
    },
    tagList () {
      return this.tags.map((tag) => {
        var isSelected = false
        if (this.currentStar.tags.length) {
          isSelected = this.currentStar.tags.map(function (starTag) {
            return starTag.id
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
  created () {
    this.$bus.$on('SYNC_TAGS', tags => this.syncTags(tags))
    this.$bus.$on('NOTES_SAVED', (notes) => { this.saveNotes(notes) })
    this.$bus.$on('HIDE_TAG_DROPDOWN', () => {
      this.tagEditorShowing = false
    })
    this.$bus.$on('STAR_CHANGED', () => {
      this.noteEditorShowing = false
      this.readmeLoading = true
      this.fetchReadme({ name: this.currentStar.full_name, accessToken: this.user.access_token }).then(() => {
        this.readmeError = false
        this.readmeLoading = false
        this.readmeNotFound = false
      }).catch((errors) => {
        if (errors.message === 'Not Found') {
          this.readmeNotFound = true
        } else {
          this.readmeError = true
          this.$bus.$emit('NOTIFICATION', 'Unable to fetch readme from GitHub.', 'error')
        }
        this.readmeLoading = false
      })
    })
  },
  methods: {
    ...mapActions({
      editStarNotes: 'editStarNotes',
      fetchReadme: 'fetchReadme',
      sync: 'syncTags'
    }),
    showTagEditor () { this.tagEditorShowing = true },
    hideTagEditor () { this.tagEditorShowing = false },
    clickedAwayFromTagEditor (e) {
      if (!e.target.classList.contains('toggle-tag-editor') && !e.target.classList.contains('select2-selection__choice__remove')) {
        this.hideTagEditor()
      }
    },
    syncTags (tags) {
      this.sync({ repo: this.currentStar, tags: tags }).then((res) => {
        this.$bus.$emit('NOTIFICATION', `Tags for ${this.currentStar.full_name} updated.`)
      }).catch((errors) => {
        this.$bus.$emit('NOTIFICATION', 'There was an error saving these tags.', 'error')
      })
      this.hideTagEditor()
    },
    saveNotes (notes) {
      this.editStarNotes({ star: this.currentStar, text: notes }).catch((errors) => {
        this.$bus.$emit('NOTIFICATION', 'There was an error saving your notes for this star.', 'error')
      })
    },
    focusCloneInput () {
      setTimeout(() => {
        document.getElementById('txtGitHubCloneURL').focus()
        document.getElementById('txtGitHubCloneURL').select()
      }, 0)
    }
  }
}
</script>
