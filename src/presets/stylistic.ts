import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function stylistic(): Promise<TypedFlatConfigItem[]> {
  const [pluginAntfu, pluginStylistic] = await Promise.all([
    interopDefault(import('eslint-plugin-antfu')),
    interopDefault(import('@stylistic/eslint-plugin')),
  ])

  return [
    {
      name: 'kaynooo/stylistic/rules',
      ignores: [
        '**/*.md',
      ],
      plugins: {
        antfu: pluginAntfu,
        style: pluginStylistic,
      },
      rules: {
        'style/array-bracket-newline': [
          'warn',
          'consistent',
        ],
        'style/array-bracket-spacing': [
          'error',
          'never',
        ],
        'style/array-element-newline': [
          'warn',
          'consistent',
        ],
        'style/arrow-parens': [
          'error',
          'as-needed',
          {
            requireForBlockBody: true,
          },
        ],
        'style/arrow-spacing': [
          'error',
          {
            after: true,
            before: true,
          },
        ],
        'style/block-spacing': [
          'error',
          'always',
        ],
        'style/brace-style': [
          'error',
          'stroustrup',
          {
            allowSingleLine: true,
          },
        ],
        'style/comma-dangle': [
          'error',
          'always-multiline',
        ],
        'style/comma-spacing': [
          'error',
          {
            after: true,
            before: false,
          },
        ],
        'style/comma-style': [
          'error',
          'last',
        ],
        'style/computed-property-spacing': [
          'error',
          'never',
          {
            enforceForClassMembers: true,
          },
        ],
        'style/dot-location': [
          'error',
          'property',
        ],
        'style/eol-last': 'error',
        'style/generator-star-spacing': [
          'error',
          {
            after: true,
            before: false,
          },
        ],
        'style/indent': [
          'error',
          2,
          {
            CallExpression: {
              arguments: 'first',
            },
          },
        ],
        'style/indent-binary-ops': [
          'error',
          2,
        ],
        'style/key-spacing': [
          'error',
          {
            afterColon: true,
            beforeColon: false,
          },
        ],
        'style/keyword-spacing': [
          'error',
          {
            after: true,
            before: true,
          },
        ],
        'style/lines-between-class-members': [
          'error',
          'always',
          {
            exceptAfterSingleLine: true,
          },
        ],
        'style/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'none',
              requireLast: false,
            },
            multilineDetection: 'brackets',
            overrides: {
              interface: {
                multiline: {
                  delimiter: 'none',
                  requireLast: false,
                },
              },
            },
            singleline: {
              delimiter: 'comma',
            },
          },
        ],
        'style/multiline-ternary': [
          'error',
          'always-multiline',
        ],
        // JSDoc stays a block: editors show it on hover.
        'style/multiline-comment-style': [
          'error',
          'separate-lines',
        ],
        'style/new-parens': 'error',
        'style/no-extra-parens': [
          'error',
          'functions',
        ],
        'style/no-floating-decimal': 'error',
        'style/no-mixed-operators': [
          'error',
          {
            allowSamePrecedence: true,
            groups: [
              [
                '==',
                '!=',
                '===',
                '!==',
                '>',
                '>=',
                '<',
                '<=',
              ],
              [
                '&&',
                '||',
              ],
              [
                'in',
                'instanceof',
              ],
            ],
          },
        ],
        'style/no-mixed-spaces-and-tabs': 'error',
        'style/no-multi-spaces': 'error',
        'style/no-multiple-empty-lines': [
          'error',
          {
            max: 1,
            maxBOF: 0,
            maxEOF: 0,
          },
        ],
        'style/no-tabs': 'error',
        'style/no-trailing-spaces': 'error',
        'style/no-whitespace-before-property': 'error',
        'style/object-curly-newline': [
          'warn',
          {
            consistent: true,
          },
        ],
        'style/object-curly-spacing': [
          'error',
          'always',
        ],
        'style/operator-linebreak': [
          'error',
          'before',
        ],
        'style/padded-blocks': [
          'error',
          {
            blocks: 'never',
            classes: 'never',
            switches: 'never',
          },
        ],
        'style/padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: ['const', 'let'], next: '*' },
          { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
          { blankLine: 'always', prev: ['if'], next: '*' },
          { blankLine: 'any', prev: ['if'], next: ['if'] },
          { blankLine: 'always', prev: '*', next: ['if', 'function', 'switch', 'while', 'return', 'try', 'continue', 'break', 'throw'] },
          { blankLine: 'always', prev: ['if', 'function', 'switch', 'while'], next: '*' },
        ],
        'style/quote-props': [
          'error',
          'consistent-as-needed',
        ],
        'style/quotes': [
          'error',
          'single',
          {
            allowTemplateLiterals: 'always',
            avoidEscape: false,
          },
        ],
        'style/rest-spread-spacing': [
          'error',
          'never',
        ],
        'style/semi': [
          'error',
          'never',
        ],
        'style/semi-spacing': [
          'error',
          {
            after: true,
            before: false,
          },
        ],
        'style/space-before-blocks': [
          'error',
          'always',
        ],
        'style/space-before-function-paren': [
          'error',
          {
            anonymous: 'always',
            asyncArrow: 'always',
            named: 'never',
          },
        ],
        'style/space-in-parens': [
          'error',
          'never',
        ],
        'style/space-infix-ops': 'error',
        'style/space-unary-ops': [
          'error',
          {
            nonwords: false,
            words: true,
          },
        ],
        'style/spaced-comment': [
          'error',
          'always',
          {
            block: {
              balanced: true,
              exceptions: [
                '*',
              ],
              markers: [
                '!',
              ],
            },
            line: {
              exceptions: [
                '/',
                '#',
              ],
              markers: [
                '/',
              ],
            },
          },
        ],
        'style/template-curly-spacing': 'error',
        'style/template-tag-spacing': [
          'error',
          'never',
        ],
        'style/type-annotation-spacing': [
          'error',
          {},
        ],
        'style/type-generic-spacing': 'error',
        'style/type-named-tuple-spacing': 'error',
        'style/wrap-iife': [
          'error',
          'any',
          {
            functionPrototypeMethods: true,
          },
        ],
        'style/wrap-regex': 'warn',
        'style/yield-star-spacing': [
          'error',
          {
            after: true,
            before: false,
          },
        ],
        'antfu/consistent-list-newline': 'error',
        'antfu/consistent-chaining': 'error',
        'antfu/curly': 'error',
        'antfu/if-newline': 'error',
        'antfu/top-level-function': 'error',
      },
    },
  ]
}
