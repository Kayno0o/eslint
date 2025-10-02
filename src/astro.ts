import type { Awaitable, OptionsConfig, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import github from 'eslint-plugin-github'
import _ from 'lodash'
import { commonRules } from '~'

export function astro({
  formatters,
  tailwindcssMultiline = false,
  mergeOptions,
}: {
  formatters?: OptionsFormatters
  tailwindcssMultiline?: boolean
  mergeOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
} = {}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(_.merge({
    plugins: { github, 'better-tailwindcss': eslintPluginBetterTailwindcss },
    typescript: true,
    formatters: { css: true, ...(formatters ?? {}) },
    astro: true,
    jsx: true,
    rules: _.merge(commonRules, {
      'style/indent': ['error', 2],
      'style/jsx-self-closing-comp': ['error', { component: true, html: true }],
      // tw 4
      ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
      'better-tailwindcss/no-unregistered-classes': ['warn', { detectComponentClasses: true }],
      'better-tailwindcss/enforce-consistent-line-wrapping': tailwindcssMultiline
        ? ['warn', { group: 'newLine', printWidth: 120 }]
        : ['warn', { printWidth: 0, preferSingleLine: true }],
    }),
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
      },
    },
  }, mergeOptions), ...userConfigs)
}

export default astro
