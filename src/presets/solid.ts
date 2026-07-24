import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function solid(): Promise<TypedFlatConfigItem[]> {
  const [pluginSolid, parserTs] = await Promise.all([
    interopDefault(import('eslint-plugin-solid')),
    interopDefault(import('@typescript-eslint/parser')),
  ])

  return [
    {
      name: 'kaynooo/solid/setup',
      plugins: { solid: pluginSolid },
    },
    {
      name: 'kaynooo/solid/rules',
      files: ['**/*.?([cm])jsx', '**/*.?([cm])tsx'],
      languageOptions: {
        sourceType: 'module',
        parser: parserTs,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      rules: {
        'solid/components-return-once': 'error',
        'solid/event-handlers': 'error',
        'solid/imports': 'error',
        'solid/jsx-no-duplicate-props': 'error',
        'solid/jsx-no-script-url': 'error',
        'solid/jsx-no-undef': [
          'error',
          {
            typescriptEnabled: true,
          },
        ],
        'solid/jsx-uses-vars': 'error',
        'solid/no-destructure': 'error',
        'solid/no-innerhtml': [
          'error',
          {
            allowStatic: true,
          },
        ],
        'solid/no-react-deps': 'error',
        'solid/no-react-specific-props': 'error',
        'solid/no-unknown-namespaces': 'off',
        'solid/prefer-for': 'error',
        'solid/reactivity': 'error',
        'solid/self-closing-comp': 'error',
        'solid/style-prop': [
          'error',
          {
            styleProps: [
              'style',
              'css',
            ],
          },
        ],
        'solid/prefer-show': 'warn',
      },
    },
  ]
}
