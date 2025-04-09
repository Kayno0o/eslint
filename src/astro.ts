import type { Awaitable, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from '~'

export function astro(...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu({
    plugins: { github },
    astro: true,
    stylistic: true,
    regexp: true,
    typescript: true,
    jsx: true,
    rules: {
      ...commonRules,
      'style/indent': ['error', 2],
      'style/jsx-indent': 'off',
      'style/jsx-one-expression-per-line': 'off',
    },
  }, ...userConfigs)
}

export default astro
