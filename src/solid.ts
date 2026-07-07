import type { Awaitable, OptionsConfig, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import merge from 'lodash.merge'
import { commonRules, kaynoooPlugin, typeAwareRules } from './index'

export default async function solid({
  formatters,
  tailwindcssMultiline = false,
  mergeOptions,
  strict = false,
}: {
  formatters?: OptionsFormatters
  tailwindcssMultiline?: boolean
  mergeOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
  strict?: boolean
} = {}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(
    merge(
      {
        ignores: ['**/*.md'],
        plugins: { 'kaynooo': kaynoooPlugin, 'better-tailwindcss': eslintPluginBetterTailwindcss },
        typescript: strict
          ? {
            tsconfigPath: 'tsconfig.json',
            filesTypeAware: ['**/*.?([cm])ts', '**/*.?([cm])tsx', '**/*.vue'],
          }
          : true,
        formatters: { css: true, ...(formatters ?? {}) },
        solid: {
          overrides: {
            'solid/reactivity': 'error',
            'solid/components-return-once': 'error',
            'solid/event-handlers': 'error',
            'solid/prefer-show': 'warn',
          },
        },
        jsx: true,
        rules: merge(commonRules, {
          'style/indent': ['error', 2],
          'style/jsx-self-closing-comp': ['error', { component: true, html: true }],
          'style/jsx-tag-spacing': 'off',
          // tw 4
          ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
          'better-tailwindcss/enforce-consistent-line-wrapping': tailwindcssMultiline
            ? ['warn', { group: 'newLine', printWidth: 120 }]
            : ['warn', { printWidth: 0, preferSingleLine: true }],
          'better-tailwindcss/no-unknown-classes': ['warn', { detectComponentClasses: true }],
          'better-tailwindcss/enforce-shorthand-classes': ['warn'],
          'better-tailwindcss/enforce-consistent-important-position': ['warn', { position: 'recommended' }],
          'better-tailwindcss/enforce-consistent-variable-syntax': ['warn'],
        }),
        settings: {
          'better-tailwindcss': {
            entryPoint: 'src/styles/global.css',
          },
        },
      },
      mergeOptions,
    ),
    {
      // fix for @eslint/markdown@7.x
      files: ['**/*.md'],
      rules: {
        'logical-assignment-operators': 'off',
      },
    },
    strict
      ? {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.astro', '**/*.tsx'],
        rules: typeAwareRules,
      }
      : {},
    ...userConfigs,
  )
}
