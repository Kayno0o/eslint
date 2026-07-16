import type { TypedFlatConfigItem } from '../types'

export function disables(): TypedFlatConfigItem[] {
  return [
    {
      name: 'antfu/disables/scripts',
      files: [
        '**/scripts/**/*.?([cm])[jt]s?(x)',
      ],
      rules: {
        'antfu/no-top-level-await': 'off',
        'no-console': 'off',
        'ts/explicit-function-return-type': 'off',
      },
    },
    {
      name: 'antfu/disables/cli',
      files: [
        '**/cli/**/*.?([cm])[jt]s?(x)',
        '**/cli.?([cm])[jt]s?(x)',
      ],
      rules: {
        'antfu/no-top-level-await': 'off',
        'no-console': 'off',
      },
    },
    {
      name: 'antfu/disables/bin',
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
      name: 'antfu/disables/dts',
      files: [
        '**/*.d.?([cm])ts',
      ],
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'no-restricted-syntax': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
    {
      name: 'antfu/disables/cjs',
      files: [
        '**/*.js',
        '**/*.cjs',
      ],
      rules: {
        'ts/no-require-imports': 'off',
      },
    },
    {
      name: 'antfu/disables/config-files',
      files: [
        '**/*.config.?([cm])[jt]s?(x)',
        '**/*.config.*.?([cm])[jt]s?(x)',
      ],
      rules: {
        'antfu/no-top-level-await': 'off',
        'no-console': 'off',
        'ts/explicit-function-return-type': 'off',
      },
    },
  ]
}
