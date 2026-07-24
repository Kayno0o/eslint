import type { TypedFlatConfigItem } from '../types'
import { pluginTest } from '../plugins'

export function test(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/test/setup',
      plugins: {
        test: pluginTest,
      },
    },
    {
      name: 'kaynooo/test/rules',
      files: [
        '**/__tests__/**/*.?([cm])[jt]s?(x)',
        '**/*.spec.?([cm])[jt]s?(x)',
        '**/*.test.?([cm])[jt]s?(x)',
        '**/*.bench.?([cm])[jt]s?(x)',
        '**/*.benchmark.?([cm])[jt]s?(x)',
      ],
      rules: {
        'test/no-only-tests': 'error',
        'antfu/no-top-level-await': 'off',
        'e18e/prefer-static-regex': 'off',
        'no-unused-expressions': 'off',
        'ts/explicit-function-return-type': 'off',
      },
    },
  ]
}
