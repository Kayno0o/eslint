import type { TypedFlatConfigItem } from '../types'
import { markdownProcessor, pluginMarkdown } from '../plugins'

export function markdown(): TypedFlatConfigItem[] {
  return [
    {
      name: 'antfu/markdown/setup',
      plugins: {
        markdown: pluginMarkdown,
      },
    },
    {
      name: 'antfu/markdown/processor',
      files: [
        '**/*.md',
      ],
      ignores: [
        '**/*.md/*.md',
      ],
      processor: markdownProcessor,
    },
    {
      name: 'antfu/markdown/parser',
      files: [
        '**/*.md',
      ],
      language: 'markdown/gfm',
    },
    {
      name: 'antfu/markdown/rules',
      files: [
        '**/*.md',
      ],
      rules: {
        'markdown/fenced-code-language': 'off',
        'markdown/heading-increment': 'error',
        'markdown/no-duplicate-definitions': 'error',
        'markdown/no-empty-definitions': 'error',
        'markdown/no-empty-images': 'error',
        'markdown/no-empty-links': 'error',
        'markdown/no-invalid-label-refs': 'error',
        'markdown/no-missing-atx-heading-space': 'error',
        'markdown/no-missing-label-refs': 'off',
        'markdown/no-missing-link-fragments': 'error',
        'markdown/no-multiple-h1': 'error',
        'markdown/no-reference-like-urls': 'error',
        'markdown/no-reversed-media-syntax': 'error',
        'markdown/no-space-in-emphasis': 'error',
        'markdown/no-unused-definitions': 'error',
        'markdown/require-alt-text': 'error',
        'markdown/table-column-count': 'error',
      },
    },
    {
      name: 'antfu/markdown/disables/code',
      files: [
        '**/*.md/**/*.?([cm])[jt]s?(x)',
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            impliedStrict: true,
          },
        },
      },
      rules: {
        'antfu/no-top-level-await': 'off',
        'e18e/prefer-static-regex': 'off',
        'no-alert': 'off',
        'no-console': 'off',
        'no-labels': 'off',
        'no-lone-blocks': 'off',
        'no-restricted-syntax': 'off',
        'no-undef': 'off',
        'no-unused-expressions': 'off',
        'no-unused-labels': 'off',
        'no-unused-vars': 'off',
        'node/prefer-global/process': 'off',
        'style/comma-dangle': 'off',
        'style/eol-last': 'off',
        'style/padding-line-between-statements': 'off',
        'ts/consistent-type-imports': 'off',
        'ts/explicit-function-return-type': 'off',
        'ts/no-namespace': 'off',
        'ts/no-redeclare': 'off',
        'ts/no-require-imports': 'off',
        'ts/no-unused-expressions': 'off',
        'ts/no-unused-vars': 'off',
        'ts/no-use-before-define': 'off',
        'unicode-bom': 'off',
        'unused-imports/no-unused-imports': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
  ]
}
