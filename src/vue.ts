import type { Awaitable, OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import eslintPluginTailwindCSS from 'eslint-plugin-better-tailwindcss'
import github from 'eslint-plugin-github'
import _ from 'lodash'
import { commonRules } from '~'

export function vue({
  i18n = false,
  tailwindcss = undefined,
  tailwindcssConfigFile = 'tailwind.config.ts',
  tailwindcssEntryPoint = 'app/assets/css/main.css',
  mergeOptions = {},
  tailwindcssMultiline = false,
}: {
  i18n?: boolean
  tailwindcss?: 3 | 4
  tailwindcssConfigFile?: string
  tailwindcssEntryPoint?: string
  mergeOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
  tailwindcssMultiline?: boolean
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(_.merge({
    plugins: {
      github,
      ...(tailwindcss && { 'better-tailwindcss': eslintPluginTailwindCSS }),
    },
    typescript: true,
    vue: { a11y: true, vueVersion: 3 },
    formatters: { css: true },
    rules: {
      ...commonRules,
      'vue/max-attributes-per-line': ['error', { multiline: { max: 1 }, singleline: { max: 3 } }],
      'vue/html-button-has-type': 'error',
      'vue/array-bracket-newline': ['warn', 'consistent'],
      'vue/array-element-newline': ['warn', 'consistent'],
      'vue/object-curly-newline': ['warn', { consistent: true, multiline: true }],
      'vue/no-implicit-coercion': ['error', { number: true, boolean: true, string: true, disallowTemplateShorthand: true }],
      'vue/require-explicit-emits': 'error',
      'vue/require-explicit-slots': 'warn',
      // false positive
      'vue-a11y/label-has-for': 'off',
      // custom options
      ...(i18n && {
        'vue/no-bare-strings-in-template': ['error'],
      }),
      ...(tailwindcss && {
        ...eslintPluginTailwindCSS.configs['recommended-warn'].rules,
        'better-tailwindcss/no-unregistered-classes': ['warn', { detectComponentClasses: true }],
        'better-tailwindcss/enforce-consistent-line-wrapping': tailwindcssMultiline
          ? ['warn', { group: 'newLine', printWidth: 120 }]
          : ['warn', { printWidth: 0, preferSingleLine: true }],
      }),
      ...mergeOptions?.rules,
    },
  }, tailwindcss === 3 && {
    rules: {
      'better-tailwindcss/no-conflicting-classes': 'off',
    },
    settings: {
      'better-tailwindcss': {
        tailwindConfig: tailwindcssConfigFile ?? 'tailwind.config.ts',
      },
    },
  }, tailwindcss === 4 && {
    settings: {
      'better-tailwindcss': {
        entryPoint: tailwindcssEntryPoint ?? 'app/assets/css/main.css',
      },
    },
  }, mergeOptions), ...userConfigs)
}

export default vue
