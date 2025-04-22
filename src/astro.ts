import type { Awaitable, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from '~'

export function astro(options?: {
  formatters?: OptionsFormatters
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu({
    plugins: { github },
    typescript: true,
    //
    formatters: { css: true, ...(options?.formatters ?? {}) },
    astro: true,
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
