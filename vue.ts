import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from './index.ts'

export const vue = antfu({
  plugins: { github },
  typescript: true,
  vue: true,
  formatters: { css: true },
  rules: {
    ...commonRules,
    'vue/max-attributes-per-line': ['error', { multiline: { max: 1 }, singleline: { max: 3 } }],
  },
})
