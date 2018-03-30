module.exports = {
  extends: ['standard', 'plugin:vue/essential'],
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true
      }
    }
  ]
}
