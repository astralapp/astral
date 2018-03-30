module.exports = {
  parserOptions: {
    ecmaVersion: 8
  },
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
