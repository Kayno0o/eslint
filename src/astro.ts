import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from './index'

export function astro() {
  return antfu({
    plugins: { github },
    astro: true,
    stylistic: true,
    regexp: true,
    typescript: true,
    jsx: true,
    rules: {
      ...commonRules,
      'antfu/no-top-level-await': 'off',
      'no-console': 'off',
    },
  })
}

export default astro
