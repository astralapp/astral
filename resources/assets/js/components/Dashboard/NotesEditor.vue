<template>
  <div class="absolute pin-t pin-l pin-b mt-16 w-full bg-white flex flex-col">
    <textarea ref="editor"></textarea>
    <div class="repo-notes-status" v-show="notesSaved">Saved</div>
  </div>
</template>
<script>
import SimpleMDE from 'simplemde'
import { debounce } from 'lodash'
import 'highlight.js'
export default {
  name: 'NotesEditor',
  props: ['notes'],
  data() {
    return {
      editor: null,
      currentNotes: '',
      notesSaved: false
    }
  },
  mounted() {
    this.editor = new SimpleMDE({
      element: this.$refs.editor,
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
    this.editor.codemirror.on(
      'change',
      debounce(() => {
        this.currentNotes = this.editor.value()
        this.$nextTick(() => {
          this.saveNotes()
        })
      }, 1000)
    )
  },
  destroyed() {
    this.editor = null
  },
  watch: {
    notes(val) {
      if (this.editor.isPreviewActive()) {
        this.editor.togglePreview()
      }
      if (val === this.editor.value()) {
        return
      }
      this.editor.value(val)
    }
  },
  methods: {
    saveNotes() {
      this.$emit('save', this.currentNotes)
      this.notesSaved = true
      setTimeout(() => {
        this.notesSaved = false
      }, 3000)
    }
  }
}
</script>
<style lang="scss">
@import '~simplemde/dist/simplemde.min.css';
.editor-toolbar {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border: none;
  border-bottom: 1px solid config('colors.grey-light');
}
.CodeMirror {
  flex-grow: 1;
  border: none;
}
</style>
