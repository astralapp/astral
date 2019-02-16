const mixin = {
  methods: {
    shouldDisableKeyboardShortcuts(e) {
      return !['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !document.querySelector('.CodeMirror-focused')
    }
  }
}

export default mixin
