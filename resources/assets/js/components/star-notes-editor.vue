<template>
  <div class="repo-notes">
    <textarea class="repo-note-editor" ref="editor"></textarea>
    <div class="repo-notes-status" :class="{'active': notesSaved}">Saved</div>
  </div>
</template>
<script>
import Vue from 'vue'
import SimpleMDE from 'simplemde'
import { debounce } from 'lodash'
import 'highlight.js'

export default {
  name: 'StarNotesEditor',
  props: ['notes'],
  data () {
    return {
      editor: null,
      currentNotes: '',
      notesSaved: false
    }
  },
  mounted () {
    this.editor = new SimpleMDE({
      element: document.querySelector('.repo-note-editor'),
      initialValue: this.notes,
      forceSync: true,
      autoDownloadFontAwesome: false,
      renderingConfig: {
        codeSyntaxHighlighting: true
      },
      spellChecker: false,
      hideIcons: ['side-by-side', 'guide'],
      showIcons: ['code'],
      status: false
    })
    this.editor.codemirror.on('change', debounce(() => {
      this.currentNotes = this.editor.value()
      Vue.nextTick(() => {
        this.saveNotes()
      })
    }, 1000))
  },
  methods: {
    saveNotes () {
      this.$bus.$emit('NOTES_SAVED', this.currentNotes)
      this.notesSaved = true
      setTimeout(() => {
        this.notesSaved = false
      }, 3000)
    }
  }
}
</script>
