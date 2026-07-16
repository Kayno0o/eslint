import type { TypedFlatConfigItem } from '../types'
import { pluginNode } from '../plugins'

export function node(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/node/setup',
      plugins: {
        node: pluginNode,
      },
    },
    {
      name: 'kaynooo/node/rules',
      files: [
        '**/*.?([cm])[jt]s?(x)',
      ],
      rules: {
        'node/handle-callback-err': [
          'error',
          '^(err|error)$',
        ],
        'node/no-deprecated-api': 'error',
        'node/no-exports-assign': 'error',
        'node/no-new-require': 'error',
        'node/no-path-concat': 'error',
        'node/prefer-global/buffer': [
          'error',
          'never',
        ],
        'node/prefer-global/process': [
          'error',
          'never',
        ],
        'node/process-exit-as-throw': 'error',
      },
    },
  ]
}
