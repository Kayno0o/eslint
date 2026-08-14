import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function yaml(): Promise<TypedFlatConfigItem[]> {
  const [parserYaml, pluginYaml] = await Promise.all([
    import('yaml-eslint-parser'),
    interopDefault(import('eslint-plugin-yml')),
  ])

  return [
    {
      name: 'kaynooo/yaml/setup',
      plugins: {
        yaml: pluginYaml,
      },
    },
    {
      name: 'kaynooo/yaml/rules',
      files: [
        '**/*.y?(a)ml',
      ],
      languageOptions: {
        parser: parserYaml,
      },
      rules: {
        'style/spaced-comment': 'off',
        'yaml/block-mapping': 'error',
        'yaml/block-sequence': 'error',
        'yaml/no-boolean-key': 'error',
        'yaml/no-empty-key': 'error',
        'yaml/no-empty-sequence-entry': 'error',
        'yaml/no-irregular-whitespace': 'error',
        'yaml/plain-scalar': 'error',
        'yaml/vue-custom-block/no-parsing-error': 'error',
        'yaml/block-mapping-question-indicator-newline': 'error',
        'yaml/block-sequence-hyphen-indicator-newline': 'error',
        'yaml/flow-mapping-curly-newline': 'error',
        'yaml/flow-mapping-curly-spacing': 'error',
        'yaml/flow-sequence-bracket-newline': 'error',
        'yaml/flow-sequence-bracket-spacing': 'error',
        'yaml/indent': [
          'error',
          2,
        ],
        'yaml/key-spacing': 'error',
        'yaml/no-tab-indent': 'error',
        'yaml/quotes': [
          'error',
          {
            avoidEscape: true,
            prefer: 'single',
          },
        ],
        'yaml/spaced-comment': 'error',
      },
    },
  ]
}
