module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 8
  },
  extends: ['standard', 'plugin:vue/recommended'],
  plugins: ['vue'],
  rules: {
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off'
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
