import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function test(): Promise<TypedFlatConfigItem[]> {
  const pluginTest = await interopDefault(import('eslint-plugin-no-only-tests'))

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
        '**/*.e2e.?([cm])[jt]s?(x)',
        '**/*.bench.?([cm])[jt]s?(x)',
        '**/*.benchmark.?([cm])[jt]s?(x)',
      ],
      rules: {
        'test/no-only-tests': 'error',
        'e18e/prefer-static-regex': 'off',
        'no-unused-expressions': 'off',
        // A stub returning a promise with nothing to await stays `async () => value`, as strict's ts/promise-function-async wants.
        'ts/require-await': 'off',
      },
    },
  ]
}
