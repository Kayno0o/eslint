import type { TypedFlatConfigItem } from '../types'

export function jsx(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/jsx/setup',
      files: [
        '**/*.?([cm])jsx',
        '**/*.?([cm])tsx',
      ],
      plugins: {
      },
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      rules: {},
    },
  ]
}
