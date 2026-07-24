import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function comments(): Promise<TypedFlatConfigItem[]> {
  const pluginComments = await interopDefault(import('@eslint-community/eslint-plugin-eslint-comments'))

  return [
    {
      name: 'kaynooo/eslint-comments/rules',
      ignores: [
        '**/*.md',
      ],
      plugins: {
        'eslint-comments': pluginComments,
      },
      rules: {
        'eslint-comments/no-aggregating-enable': 'error',
        'eslint-comments/no-duplicate-disable': 'error',
        'eslint-comments/no-unlimited-disable': 'error',
        'eslint-comments/no-unused-enable': 'error',
      },
    },
  ]
}
