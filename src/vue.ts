import type { Awaitable, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'
import { commonRules } from '~'

export function vue(...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu({
    plugins: { github },
    typescript: true,
    vue: { a11y: true, vueVersion: 3 },
    formatters: { css: true },
    rules: {
      ...commonRules,
      'vue/max-attributes-per-line': ['error', { multiline: { max: 1 }, singleline: { max: 3 } }],
    },
  }, ...userConfigs)
}

export default vue
