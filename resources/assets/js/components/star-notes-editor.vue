<template>
  <div class="repo-notes">
    <textarea class="repo-note-editor" v-el:editor></textarea>
    <div class="repo-notes-status" :class="{'active': notesSaved}">Saved</div>
  </div>
</template>
<script>
import Vue from "vue";
import highlight from "highlight.js";
import SimpleMDE from "simplemde";
import { debounce } from "lodash";
export default {
  name: "StarNotesEditor",
  props: ["notes"],
  data(){
    return {
      editor: null,
      currentNotes: "",
      notesSaved: false
    }
  },
  ready(){
    this.editor = new SimpleMDE({
      element: this.$els.editor,
      initialValue: this.notes,
      forceSync: true,
      autoDownloadFontAwesome: false,
      renderingConfig: {
        codeSyntaxHighlighting: true
      },
      spellChecker: false,
      hideIcons: ["side-by-side", "guide"],
      showIcons: ["code"],
      status: false
    });
    this.editor.codemirror.on("change", debounce(() => {
      this.currentNotes = this.editor.value();
      Vue.nextTick(() => {
        this.saveNotes()
      });
    }, 1000))
  },
  methods: {
    saveNotes (){
      this.$dispatch("NOTES_SAVED", this.currentNotes);
      this.notesSaved = true
      setTimeout(() => {
        this.notesSaved = false
      }, 3000)
    }
  },
  events: {
    "STAR_CHANGED": function(){
      //Set new notes
      Vue.nextTick(() => {
        this.editor.value(this.notes);
      })
    }
  },
}
</script>
