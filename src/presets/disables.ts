import type { TypedFlatConfigItem } from '../types'

export function disables(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/disables/scripts',
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
      name: 'kaynooo/disables/cli',
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
    {
      name: 'kaynooo/disables/cjs',
      files: [
        '**/*.js',
        '**/*.cjs',
      ],
      rules: {
        'ts/no-require-imports': 'off',
      },
    },
    {
      name: 'kaynooo/disables/config-files',
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
