import type { TypedFlatConfigItem } from '../types'

export function disables(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/disables/bin',
      files: [
        '**/bin/**/*',
        '**/bin.?([cm])[jt]s?(x)',
      ],
      rules: {
        'antfu/no-import-dist': 'off',
        'antfu/no-import-node-modules-by-path': 'off',
      },
    },
    {
      name: 'kaynooo/disables/dts',
      files: [
        '**/*.d.?([cm])ts',
      ],
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'no-restricted-syntax': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
  ]
}
