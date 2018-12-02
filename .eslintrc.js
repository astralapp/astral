module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: ['prettier', 'plugin:vue/recommended'],
  plugins: ['prettier', 'vue'],
  rules: {
    'prettier/prettier': 'error',
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
