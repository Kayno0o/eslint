import type { StatementGroup, StatementType, TypedFlatConfigItem } from '../types'
import { kaynoooPlugin } from '../plugin'

const paddingBefore: StatementType[] = ['return', 'try', 'continue', 'break', 'throw']
const paddingAfter: StatementType[] = []
const paddingAround: StatementType[] = ['if', 'function', 'switch', 'while']

const paddingGroups: StatementGroup[] = [
  ['const', 'let'],
  ['if'],
]

export function kaynooo(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/rules',
      ignores: ['**/*.md'],
      plugins: { kaynooo: kaynoooPlugin },
      rules: {
        'antfu/no-top-level-await': 'off',

        'kaynooo/array-foreach': 'error',
        'kaynooo/max-statements-per-line': 'error',
        'kaynooo/no-empty-first-last-line': 'error',
        'kaynooo/no-then': 'error',

        'style/max-statements-per-line': 'off',

        'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
        'new-cap': ['error'],

        'no-console': 'off',
        'no-else-return': ['error', { allowElseIf: false }],
        'no-empty-function': 'off',
        'no-implicit-coercion': ['error', { number: true, boolean: true, string: true, disallowTemplateShorthand: true }],
        'no-lonely-if': ['error'],

        'operator-assignment': ['error', 'always'],

        'style/array-bracket-newline': ['warn', 'consistent'],
        'style/array-element-newline': ['warn', 'consistent'],
        'style/indent': ['error', 2, { CallExpression: { arguments: 'first' } }],
        'style/object-curly-newline': ['warn', { consistent: true }],
        'style/wrap-regex': 'warn',
        'style/padding-line-between-statements': [
          'error',

          ...paddingGroups.flatMap(group => [
            { blankLine: 'always' as const, prev: group, next: '*' as const },
            { blankLine: 'any' as const, prev: group, next: group },
          ]),

          { blankLine: 'always', prev: '*', next: [...paddingAround, ...paddingBefore] },
          { blankLine: 'always', prev: [...paddingAround, ...paddingAfter], next: '*' },
        ],

        'ts/adjacent-overload-signatures': 'error',
        'ts/array-type': 'error',
        'ts/ban-ts-comment': 'error',
        'ts/ban-tslint-comment': 'error',
        'ts/class-literal-property-style': 'error',
        'ts/consistent-generic-constructors': 'error',
        'ts/consistent-indexed-object-style': 'error',
        'ts/consistent-type-definitions': 'error',
        'ts/no-confusing-non-null-assertion': 'error',
        'ts/no-empty-function': 'error',
        'ts/no-empty-interface': 'off',
        'ts/no-inferrable-types': 'error',
        'ts/prefer-for-of': 'error',
        'ts/prefer-function-type': 'error',
        'ts/prefer-namespace-keyword': 'error',

        'unicorn/no-new-array': 'off',

        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      },
    },
    {
      // fix for @eslint/markdown@7.x
      name: 'kaynooo/markdown/fix',
      files: ['**/*.md'],
      rules: {
        'logical-assignment-operators': 'off',
      },
    },
  ]
}

export function kaynoooTypeAware(files: string[]): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/rules-type-aware',
      files,
      ignores: ['**/*.md/**'],
      rules: {
        'ts/strict-boolean-expressions': 'error',
        'ts/no-unsafe-assignment': 'off',
      },
    },
  ]
}
