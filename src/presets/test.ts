import type { TypedFlatConfigItem } from '../types'
import { pluginTest } from '../plugins'

export function test(): TypedFlatConfigItem[] {
  return [
    {
      name: 'antfu/test/setup',
      plugins: {
        test: pluginTest,
      },
    },
    {
      name: 'antfu/test/rules',
      files: [
        '**/__tests__/**/*.?([cm])[jt]s?(x)',
        '**/*.spec.?([cm])[jt]s?(x)',
        '**/*.test.?([cm])[jt]s?(x)',
        '**/*.bench.?([cm])[jt]s?(x)',
        '**/*.benchmark.?([cm])[jt]s?(x)',
      ],
      rules: {
        'test/consistent-test-it': [
          'error',
          {
            fn: 'it',
            withinDescribe: 'it',
          },
        ],
        'test/no-identical-title': 'error',
        'test/no-import-node-test': 'error',
        'test/no-only-tests': 'error',
        'test/prefer-hooks-in-order': 'error',
        'test/prefer-lowercase-title': 'error',
        'antfu/no-top-level-await': 'off',
        'e18e/prefer-static-regex': 'off',
        'no-unused-expressions': 'off',
        'node/prefer-global/process': 'off',
        'ts/explicit-function-return-type': 'off',
      },
    },
  ]
}
