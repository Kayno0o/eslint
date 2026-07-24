import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function e18e(): Promise<TypedFlatConfigItem[]> {
  const pluginE18e = await interopDefault(import('@e18e/eslint-plugin'))

  return [
    {
      name: 'kaynooo/e18e/rules',
      ignores: [
        '**/*.md',
      ],
      plugins: {
        e18e: pluginE18e,
      },
      rules: {
        'e18e/prefer-array-at': 'off',
        'e18e/prefer-array-fill': 'error',
        'e18e/prefer-includes': 'error',
        'e18e/prefer-array-to-reversed': 'off',
        'e18e/prefer-array-to-sorted': 'off',
        'e18e/prefer-array-to-spliced': 'off',
        'e18e/prefer-nullish-coalescing': 'error',
        'e18e/prefer-object-has-own': 'error',
        'e18e/prefer-spread-syntax': 'off',
        'e18e/prefer-url-canparse': 'error',
        'e18e/prefer-array-from-map': 'off',
        'e18e/prefer-timer-args': 'error',
        'e18e/prefer-date-now': 'error',
        'e18e/prefer-regex-test': 'error',
        'e18e/prefer-array-some': 'error',
        'e18e/prefer-static-regex': 'off',
        'e18e/prefer-string-fromcharcode': 'error',
      },
    },
  ]
}
