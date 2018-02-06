<template>
<div class="star-info bg-grey-lighter relative flex flex-col">
  <div class="star-info-bar flex bg-white border-b border-grey-light h-16 px-4 items-center" v-if="!noRepoSelected">
    <a href="#" class="bg-brand rounded text-white px-3 py-2" @click="notesShowing = !notesShowing">
      <feather-icon type="star" :height="16" class="mr-1 pointer-events-none stroke-current fill-none"></feather-icon>
      <span>{{ notesShowing ? 'Hide Notes' : 'Show Notes' }}</span>
    </a>
    <div class="ml-auto">
      <label for="starCloneUrl" class="mr-2 font-bold cursor-pointer">Clone:</label>
      <input 
        type="text" 
        readonly="readonly" 
        id="starCloneUrl"
        class="github-clone-url rounded border-2 border-grey-light h-10 px-2 focus-none transition-border-color" 
        :value="currentStarCloneUrl" 
        @focus="highlightText"
      />
    </div>
  </div>
  <div class="flex flex-1 items-center justify-center w-full bg-grey-lighter" v-if="noRepoSelected">
    <span class="font-bold text-grey">No Repo Selected</span>
  </div>
  <readme v-if="readme" :readme="readme"></readme>
  <div class="flex flex-1 items-center justify-center w-full bg-grey-lighter" v-if="repoHasNoReadme">
    <span class="font-bold text-grey">No README found</span>
  </div>
  <notes-editor v-if="notesEditorShowing" @save="doEditStarNotes" :notes="currentStarNotes"></notes-editor>
</div>  
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import NotesEditor from './NotesEditor'
import Readme from './Readme'
// import Icon from './../FeatherIcon'
export default {
  name: 'StarInfo',
  components: {
    // Icon,
    NotesEditor,
    Readme
  },
  data() {
    return {
      notesShowing: false
    }
  },
  computed: {
    ...mapGetters(['readme', 'currentStar']),
    noRepoSelected() {
      return !Object.keys(this.currentStar).length
    },
    repoHasNoReadme() {
      return Object.keys(this.currentStar).length && !this.readme
    },
    currentStarCloneUrl() {
      return `git@github.com:${this.currentStar.node.nameWithOwner}.git`
    },
    currentStarNotes() {
      if (!this.noRepoSelected && this.currentStar.hasOwnProperty('notes')) {
        return this.currentStar.notes
      } else {
        return ''
      }
    },
    notesEditorShowing() {
      return this.notesShowing && !this.noRepoSelected
    }
  },
  methods: {
    ...mapActions(['editStarNotes']),
    doEditStarNotes(notes) {
      this.editStarNotes({
        relayId: this.currentStar.node.id,
        notes
      })
    },
    highlightText(e) {
      e.currentTarget.select()
    }
  }
}
</script>
<style lang="scss">
.github-clone-url {
  width: 300px;
  &:focus {
    border-color: config('colors.grey');
  }
}
</style>
