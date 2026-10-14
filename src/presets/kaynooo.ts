import type { TypedFlatConfigItem } from '../types'
import { kaynoooPlugin } from '../plugin'

export function kaynooo(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/rules',
      ignores: ['**/*.md'],
      plugins: { kaynooo: kaynoooPlugin },
      rules: {
        'kaynooo/array-foreach': 'error',
        'kaynooo/max-statements-per-line': 'error',
        'kaynooo/no-empty-first-last-line': 'error',
        'kaynooo/no-then': 'error',
        'kaynooo/prefer-ternary-return': 'error',
      },
    },
  ]
}
