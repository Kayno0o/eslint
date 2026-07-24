import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function imports(): Promise<TypedFlatConfigItem[]> {
  const [pluginAntfu, pluginImport] = await Promise.all([
    interopDefault(import('eslint-plugin-antfu')),
    interopDefault(import('eslint-plugin-import-lite')),
  ])

  return [
    {
      name: 'kaynooo/imports/rules',
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
