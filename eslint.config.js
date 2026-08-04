import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'tmp/**',
      'skala-vue-교수님ver/**',
      '0803_vue_-/**',
      'vue-mock-api-sample/**',
      'vue-pinia-jwt-mock-sample/**',
      'src/components/practices/basic/SampleOne_연습.vue',
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: { globals: globals.browser },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': 'off',
    },
  },
  eslintConfigPrettier,
]
