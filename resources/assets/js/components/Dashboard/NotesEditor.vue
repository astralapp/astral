<template>
  <div class="absolute pin-t pin-l pin-b mt-16 w-full bg-white flex flex-col">
    <button class="btn btn-brand absolute pin-r mt-2 mr-4 z-10 focus-none" @click="saveNotes">
      Save
    </button>
    <textarea ref="editor" />
  </div>
</template>
<script>
import EasyMDE from 'easymde'
import { debounce } from 'lodash'
import 'highlight.js'
export default {
  name: 'NotesEditor',
  props: {
    notes: String,
    autosave: Boolean
  },
  data() {
    return {
      editor: null,
      currentNotes: ''
    }
  },
  watch: {
    notes(val) {
      if (this.editor) {
        if (this.editor.isPreviewActive()) {
          this.editor.togglePreview()
        }
        if (val === this.editor.value()) {
          return
        }
        this.editor.value(val)
      }
    },
    currentNotes() {
      if (this.autosave) {
        this.$nextTick(() => {
          this.debounceSaveNotes()
        })
      }
    }
  },
  mounted() {
    this.editor = new EasyMDE({
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
          action: EasyMDE.toggleBold,
          className: 'fas fa-bold',
          title: 'Bold'
        },
        {
          name: 'italic',
          action: EasyMDE.toggleItalic,
          className: 'fas fa-italic',
          title: 'Italic'
        },
        {
          name: 'heading',
          action: EasyMDE.toggleHeadingSmaller,
          className: 'fas fa-heading',
          title: 'Heading'
        },
        '|',
        {
          name: 'code',
          action: EasyMDE.toggleCodeBlock,
          className: 'fas fa-code',
          title: 'Code'
        },
        {
          name: 'quote',
          action: EasyMDE.toggleBlockquote,
          className: 'fas fa-quote-left',
          title: 'Quote'
        },
        {
          name: 'unordered-list',
          action: EasyMDE.toggleUnorderedList,
          className: 'fas fa-list-ul',
          title: 'Unordered List'
        },
        {
          name: 'ordered-list',
          action: EasyMDE.toggleOrderedList,
          className: 'fas fa-list-ol',
          title: 'Ordered List'
        },
        '|',
        {
          name: 'link',
          action: EasyMDE.drawLink,
          className: 'fas fa-link',
          title: 'Link'
        },
        {
          name: 'image',
          action: EasyMDE.drawImage,
          className: 'fas fa-image',
          title: 'Image'
        },
        '|',
        {
          name: 'preview',
          action: EasyMDE.togglePreview,
          className: 'fas fa-eye',
          title: 'Preview'
        },
        {
          name: 'fullscreen',
          action: EasyMDE.toggleFullScreen,
          className: 'fas fa-arrows-alt',
          title: 'Image'
        }
      ]
    })
    this.editor.codemirror.on('change', () => {
      this.currentNotes = this.editor.value()
    })
  },
  destroyed() {
    this.editor = null
  },
  methods: {
    saveNotes() {
      this.$emit('save', this.currentNotes)
    },
    debounceSaveNotes: debounce(function() {
      this.saveNotes()
    }, 1000)
  }
}
</script>
<style lang="scss">
@import '~easymde/dist/easymde.min.css';
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
