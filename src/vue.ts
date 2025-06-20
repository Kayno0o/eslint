import type { Awaitable, OptionsConfig, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import github from 'eslint-plugin-github'
import _ from 'lodash'
import { commonRules } from '~'

export function vue(options?: {
  i18n?: boolean
  formatters?: OptionsFormatters
  mergeOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(_.merge({
    plugins: { github, 'better-tailwindcss': eslintPluginBetterTailwindcss },
    typescript: true,
    //
    vue: { a11y: true, vueVersion: 3 },
    formatters: { css: true, ...(options?.formatters ?? {}) },
    rules: {
      ...commonRules,
      'vue/max-attributes-per-line': ['error', { multiline: { max: 1 }, singleline: { max: 3 } }],
      'vue/html-button-has-type': 'error',
      'vue/array-bracket-newline': ['warn', 'consistent'],
      'vue/array-element-newline': ['warn', 'consistent'],
      'vue/object-curly-newline': ['warn', { consistent: true, multiline: true }],
      'vue/no-implicit-coercion': ['error', { number: true, boolean: true, string: true, disallowTemplateShorthand: true }],
      'vue/static-class-names-order': 'error',
      ...(options?.i18n && {
        'vue/no-bare-strings-in-template': 'error',
      }),
      // false positive
      'vue-a11y/label-has-for': 'off',
      // tailwindcss 4
      ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
      'better-tailwindcss/no-unregistered-classes': ['warn', { detectComponentClasses: true }],
      'better-tailwindcss/multiline': ['warn', { printWidth: 0 }],
    },
  }, options?.mergeOptions), ...userConfigs)
}

export default vue
