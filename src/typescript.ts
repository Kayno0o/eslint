import type { Awaitable, OptionsConfig, OptionsFormatters, TypedFlatConfigItem } from '@antfu/eslint-config'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'
import type { Linter } from 'eslint/universal'
import antfu from '@antfu/eslint-config'
import merge from 'lodash.merge'
import { commonRules, kaynoooPlugin, typeAwareRules } from './index'

export default async function typescript(options?: {
  formatters?: OptionsFormatters
  mergeOptions?: OptionsConfig & Omit<TypedFlatConfigItem, 'files'>
  strict?: boolean
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | FlatConfigComposer<any, any> | Linter.Config[]>[]) {
  return antfu(
    merge(
      {
        ignores: ['**/*.md'],
        plugins: { kaynooo: kaynoooPlugin },
        formatters: options?.formatters,
        typescript: options?.strict
          ? {
            tsconfigPath: 'tsconfig.json',
            filesTypeAware: ['**/*.?([cm])ts', '**/*.?([cm])tsx', '**/*.vue'],
          }
          : true,
        rules: commonRules,
      },
      options?.mergeOptions,
    ),
    options?.strict
      ? {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
        rules: typeAwareRules,
      }
      : {},
    {
      // fix for @eslint/markdown@7.x
      files: ['**/*.md'],
      rules: {
        'logical-assignment-operators': 'off',
      },
    },
    ...userConfigs,
  )
}
