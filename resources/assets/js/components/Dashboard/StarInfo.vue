<template>
  <div class="relative flex flex-col star-info bg-grey-lighter">
    <div v-if="!noRepoSelected" class="flex items-center h-16 px-4 bg-white border-b star-info-bar border-grey-light">
      <button
        class="px-2 py-2 text-xs font-bold tracking-wide uppercase rounded bg-grey-light hover:bg-grey transition-bg text-grey-darkest focus-none"
        @click="notesShowing = !notesShowing"
      >
        <Icon
          :type="toggleNotesIcon"
          height="16"
          width="16"
          class="inline-block mr-1 align-bottom pointer-events-none stroke-current fill-none"
        />
        <span>{{ notesShowing ? 'Hide Notes' : 'Show Notes' }}</span>
      </button>
      <button
        class="hidden px-2 py-2 ml-4 text-xs font-bold tracking-wide no-underline uppercase rounded bg-grey-light hover:bg-grey transition-bg text-grey-darkest focus-none"
        @click="unstar"
      >
        <Icon
          type="StarIcon"
          height="16"
          width="16"
          class="inline-block mr-1 align-bottom pointer-events-none stroke-current fill-none"
        />
        <span>Unstar</span>
      </button>
      <div class="ml-auto">
        <span class="last-updated-date mr-2">Last Updated: {{ dateFormat }}</span>
        <label for="starCloneUrl" class="mr-2 font-bold cursor-pointer">Clone:</label>
        <input
          id="starCloneUrl"
          :value="currentStarCloneUrl"
          type="text"
          readonly="readonly"
          class="h-10 px-2 border-2 rounded github-clone-url border-grey-light focus-none transition-border-color"
          @focus="highlightText"
        />
      </div>
    </div>
    <div
      v-if="noRepoSelected"
      class="flex flex-col items-center justify-center flex-1 w-full bg-grey-lighter no-repo-selected"
    >
      <img src="/images/not-selected.svg" class="w-64 mb-8" />
      <span class="px-4 py-2 font-bold text-white rounded bg-grey">No Repo Selected</span>
    </div>
    <Readme v-if="readme && !noRepoSelected" :readme="readme" :star="currentStar" />
    <div v-if="repoHasNoReadme" class="flex flex-col items-center justify-center flex-1 w-full bg-grey-lighter">
      <img src="/images/no-readme.svg" class="w-64 mb-8" />
      <span class="px-4 py-2 font-bold text-white rounded bg-grey">No README Found</span>
    </div>
    <div
      class="absolute flex items-center justify-center w-full h-full opacity-0 pointer-events-none readme-loader pin-t pib-b pin-l transition-opacity"
      :class="{ 'opacity-100 pointer-events-auto': readmeLoading }"
    >
      <img src="/images/status-spinner-dark.svg" alt="..." class="spin" width="32" height="32" />
    </div>
    <NotesEditor
      v-if="notesEditorShowing"
      :notes="currentStarNotes"
      :autosave="user.autosave_notes"
      @save="doEditStarNotes"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import dayjs from 'dayjs'
import NotesEditor from '@/components/Dashboard/NotesEditor'
import Readme from '@/components/Dashboard/Readme'
import Icon from '@/components/Icon'
export default {
  name: 'StarInfo',
  components: {
    Icon,
    NotesEditor,
    Readme
  },
  data() {
    return {
      notesShowing: false
    }
  },
  computed: {
    ...mapGetters(['readme', 'readmeLoading', 'currentStar', 'user']),
    noRepoSelected() {
      return !Object.keys(this.currentStar).length
    },
    repoHasNoReadme() {
      return Object.keys(this.currentStar).length && !this.readme && !this.readmeLoading
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
    },
    toggleNotesIcon() {
      return this.currentStarNotes ? 'FileTextIcon' : 'FileIcon'
    },
    dateFormat() {
      return dayjs(this.currentStar.node.pushedAt).format('MMM D, YYYY')
    }
  },
  methods: {
    ...mapActions(['editStarNotes', 'unstarStar']),
    async doEditStarNotes(notes) {
      this.editStarNotes({
        id: this.currentStar.node.databaseId,
        notes
      })
      this.$bus.$emit('NOTIFICATION', 'Notes saved!')
    },
    highlightText(e) {
      e.currentTarget.select()
    },
    unstar() {
      if (this.user.scope !== 'public_repo') {
        if (
          window.confirm('Unstarring repositories requires elevated auth privileges. Would you like to grant them?')
        ) {
          window.location.assign('/auth/github?scope=public_repo')
        }
      } else {
        this.unstarStar({
          databaseId: this.currentStar.node.databaseId,
          nodeId: this.currentStar.node.id
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.readme-loader {
  background-color: rgba(#fff, 0.85);
}

.github-clone-url {
  width: 300px;
  &:focus {
    border-color: config('colors.grey');
  }
}
</style>
