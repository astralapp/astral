<template>
  <div class="absolute pin-t pin-l pin-b mt-16 w-full bg-white flex flex-col">
    <textarea ref="editor"/>
    <div
      class="repo-notes-status"
      v-show="notesSaved">Saved</div>
  </div>
</template>
<script>
import SimpleMDE from 'simplemde'
import { debounce } from 'lodash'
import 'highlight.js'
export default {
  name: 'NotesEditor',
  props: ['notes'],
  data () {
    return {
      editor: null,
      currentNotes: '',
      notesSaved: false
    }
  },
  watch: {
    notes (val) {
      if (this.editor.isPreviewActive()) {
        this.editor.togglePreview()
      }
      if (val === this.editor.value()) {
        return
      }
      this.editor.value(val)
    }
  },
  mounted () {
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
      status: false,
      toolbar: [
        {
          name: 'bold',
          action: SimpleMDE.toggleBold,
          className: 'fas fa-bold',
          title: 'Bold'
        },
        {
          name: 'italic',
          action: SimpleMDE.toggleItalic,
          className: 'fas fa-italic',
          title: 'Italic'
        },
        {
          name: 'heading',
          action: SimpleMDE.toggleHeadingSmaller,
          className: 'fas fa-heading',
          title: 'Heading'
        },
        '|',
        {
          name: 'code',
          action: SimpleMDE.toggleCodeBlock,
          className: 'fas fa-code',
          title: 'Code'
        },
        {
          name: 'quote',
          action: SimpleMDE.toggleBlockquote,
          className: 'fas fa-quote-left',
          title: 'Quote'
        },
        {
          name: 'unordered-list',
          action: SimpleMDE.toggleUnorderedList,
          className: 'fas fa-list-ul',
          title: 'Unordered List'
        },
        {
          name: 'ordered-list',
          action: SimpleMDE.toggleOrderedList,
          className: 'fas fa-list-ol',
          title: 'Ordered List'
        },
        '|',
        {
          name: 'link',
          action: SimpleMDE.drawLink,
          className: 'fas fa-link',
          title: 'Link'
        },
        {
          name: 'image',
          action: SimpleMDE.drawImage,
          className: 'fas fa-image',
          title: 'Image'
        },
        '|',
        {
          name: 'preview',
          action: SimpleMDE.togglePreview,
          className: 'fas fa-eye',
          title: 'Preview'
        },
        {
          name: 'fullscreen',
          action: SimpleMDE.toggleFullScreen,
          className: 'fas fa-arrows-alt',
          title: 'Image'
        }
      ]
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
  destroyed () {
    this.editor = null
  },
  methods: {
    saveNotes () {
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
  button {
    color: config('colors.grey-dark');
  }
}
.CodeMirror {
  flex-grow: 1;
  border: none;
}
</style>
