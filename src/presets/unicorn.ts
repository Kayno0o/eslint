import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function unicorn(): Promise<TypedFlatConfigItem[]> {
  const pluginUnicorn = await interopDefault(import('eslint-plugin-unicorn'))

  return [
    {
      name: 'kaynooo/unicorn/setup',
      plugins: {
        unicorn: pluginUnicorn,
      },
    },
    {
      name: 'kaynooo/unicorn/rules',
      files: [
        '**/*.?([cm])[jt]s?(x)',
      ],
      rules: {
        'unicorn/consistent-empty-array-spread': 'error',
        'unicorn/error-message': 'error',
        'unicorn/escape-case': 'error',
        'unicorn/new-for-builtins': 'error',
        'unicorn/no-instanceof-builtins': 'error',
        'unicorn/no-new-buffer': 'error',
        'unicorn/no-unsafe-sqlite-interpolation': 'error',
        'unicorn/no-useless-fallback-in-spread': 'error',
        'unicorn/no-useless-length-check': 'error',
        'unicorn/no-useless-spread': 'error',
        'unicorn/number-literal-case': 'error',
        'unicorn/prefer-dom-node-text-content': 'error',
        'unicorn/prefer-includes': 'error',
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/prefer-number-properties': 'error',
        'unicorn/prefer-string-starts-ends-with': 'error',
        'unicorn/prefer-type-error': 'error',
        'unicorn/throw-new-error': 'error',
      },
    },
  ]
}
