import type { Awaitable, OptionsConfig, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import _ from 'lodash'
import { commonRules } from '~'

export function astro(options?: {
  formatters?: OptionsFormatters
  overrideOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(_.merge({
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
  }, options?.overrideOptions), ...userConfigs)
}

export default astro
