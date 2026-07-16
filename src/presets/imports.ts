import type { TypedFlatConfigItem } from '../types'
import { pluginAntfu, pluginImport } from '../plugins'

export function imports(): TypedFlatConfigItem[] {
  return [
    {
      name: 'antfu/imports/rules',
      ignores: [
        '**/*.md',
      ],
      plugins: {
        antfu: pluginAntfu,
        import: pluginImport,
      },
      rules: {
        'antfu/import-dedupe': 'error',
        'antfu/no-import-dist': 'error',
        'antfu/no-import-node-modules-by-path': 'error',
        'import/consistent-type-specifier-style': [
          'error',
          'top-level',
        ],
        'import/first': 'error',
        'import/no-duplicates': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-named-default': 'error',
        'import/newline-after-import': [
          'error',
          {
            count: 1,
          },
        ],
      },
    },
  ]
}
