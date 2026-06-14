import js from '@eslint/js'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import prettierPlugin from 'eslint-plugin-prettier'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    // Global ignores must live in a config object with no other keys, otherwise
    // ESLint stops treating them as global and lints these files anyway.
    ignores: [
      'node_modules/**',
      'vendor/**',
      'public/**',
      'public/dist/**',
      '**/*.d.ts',
      'resources/**/*.d.ts',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  ...tsEslintPlugin.configs['flat/recommended'],
  ...vue.configs['flat/essential'],
  {
    files: ['resources/**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        App: 'readonly',
        RouterLink: 'readonly',
        route: 'readonly',
        useContext: 'readonly',
        useForm: 'readonly',
        useHead: 'readonly',
        useProperty: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['resources/**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ['resources/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'vue/block-lang': [
        'error',
        {
          script: { lang: 'ts' },
        },
      ],
      'vue/component-api-style': ['error', ['script-setup', 'composition']],
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/match-component-import-name': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/no-ref-object-reactivity-loss': 'off',
      'vue/no-setup-props-reactivity-loss': 'off',
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/padding-line-between-tags': 'warn',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  eslintConfigPrettier,
]
