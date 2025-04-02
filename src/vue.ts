import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from './index'

export function vue() {
  return antfu({
    plugins: { github },
    typescript: true,
    vue: { a11y: true, vueVersion: 3 },
    formatters: { css: true },
    rules: {
      ...commonRules,
      'vue/max-attributes-per-line': ['error', { multiline: { max: 1 }, singleline: { max: 3 } }],
    },
  })
}

export default vue
