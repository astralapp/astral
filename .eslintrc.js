module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: ['standard', 'plugin:vue/recommended'],
  plugins: ['standard', 'vue'],
  rules: {
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/no-v-html': 'off',
    'space-before-function-paren': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        jest: true
      }
    }
  ]
}
