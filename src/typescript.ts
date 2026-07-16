import type { Linter } from 'eslint'
import type { Awaitable, OptionsFormatters, TypedFlatConfigItem } from './types'
import merge from 'lodash.merge'
import { defineConfig } from './factory'
import { commonRules, kaynoooPlugin, typeAwareRules } from './index'

export default async function typescript(options?: {
  formatters?: OptionsFormatters
  mergeOptions?: Partial<TypedFlatConfigItem>
  strict?: boolean
}, ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | Linter.Config[]>[]) {
  const strict = options?.strict ?? false

  return defineConfig(
    {
      strict,
      tsconfigPath: strict ? 'tsconfig.json' : undefined,
      formatters: options?.formatters,
      overrides: merge(
        {
          ignores: ['**/*.md'],
          plugins: { kaynooo: kaynoooPlugin },
          rules: commonRules,
        },
        options?.mergeOptions,
      ),
    },
    strict
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
