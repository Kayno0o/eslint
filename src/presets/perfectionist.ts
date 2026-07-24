import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function perfectionist(): Promise<TypedFlatConfigItem[]> {
  const pluginPerfectionist = await interopDefault(import('eslint-plugin-perfectionist'))

  return [
    {
      name: 'kaynooo/perfectionist/setup',
      ignores: [
        '**/*.md',
      ],
      plugins: {
        perfectionist: pluginPerfectionist,
      },
      rules: {
        'perfectionist/sort-exports': [
          'error',
          {
            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-imports': [
          'error',
          {
            groups: [
              'type-import',
              [
                'type-parent',
                'type-sibling',
                'type-index',
                'type-internal',
              ],
              'value-builtin',
              'value-external',
              'value-internal',
              [
                'value-parent',
                'value-sibling',
                'value-index',
              ],
              'side-effect',
              'ts-equals-import',
              'unknown',
            ],
            newlinesBetween: 'ignore',
            newlinesInside: 'ignore',
            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-named-exports': [
          'error',
          {
            order: 'asc',
            type: 'natural',
          },
        ],
        'perfectionist/sort-named-imports': [
          'error',
          {
            order: 'asc',
            type: 'natural',
          },
        ],
      },
    },
  ]
}
