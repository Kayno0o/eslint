import type { Rules } from '@antfu/eslint-config'
import type { Linter } from 'eslint'
import arrayForeach from './rules/array-foreach'
import maxStatementPerLine from './rules/max-statements-per-line'
import noEmptyFirstLastLine from './rules/no-empty-first-last-line'
import noThen from './rules/no-then'

export const kaynoooPlugin = {
  rules: {
    'array-foreach': arrayForeach,
    'no-empty-first-last-line': noEmptyFirstLastLine,
    'no-then': noThen,
    'max-statements-per-line': maxStatementPerLine,
  },
}

type StatementType = '*' | 'exports' | 'require' | 'directive' | 'iife' | 'block' | 'empty' | 'function' | 'ts-method' | 'break' | 'case' | 'class' | 'continue' | 'debugger' | 'default' | 'do' | 'for' | 'if' | 'import' | 'switch' | 'throw' | 'try' | 'while' | 'with' | 'cjs-export' | 'cjs-import' | 'enum' | 'interface' | 'function-overload' | 'block-like' | 'singleline-block-like' | 'multiline-block-like' | 'expression' | 'singleline-expression' | 'multiline-expression' | 'return' | 'singleline-return' | 'multiline-return' | 'export' | 'singleline-export' | 'multiline-export' | 'var' | 'singleline-var' | 'multiline-var' | 'let' | 'singleline-let' | 'multiline-let' | 'const' | 'singleline-const' | 'multiline-const' | 'using' | 'singleline-using' | 'multiline-using' | 'type' | 'singleline-type' | 'multiline-type'
type StatementArrayType = [StatementType, ...StatementType[]]

const paddingBefore: StatementArrayType = ['return', 'try', 'continue', 'break', 'throw']
const paddingAfter: StatementArrayType = [] as any
const paddingAround: StatementArrayType = ['if', 'function', 'switch', 'while']

const paddingGroups: StatementArrayType[] = [
  ['const', 'let'],
  ['if'],
]

export const commonRules: Partial<Linter.RulesRecord & Rules> = {
  'antfu/no-top-level-await': 'off',

  'kaynooo/array-foreach': 'error',
  'kaynooo/no-empty-first-last-line': 'error',
  'kaynooo/no-then': 'error',
  'kaynooo/max-statements-per-line': 'error',

  'style/max-statements-per-line': 'off',

  'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
  'new-cap': ['error'],

  'no-console': 'off',
  'no-else-return': ['error', { allowElseIf: false }],
  'no-empty-function': 'off',
  'no-implicit-coercion': ['error', { number: true, boolean: true, string: true, disallowTemplateShorthand: true }],
  'no-lonely-if': ['error'],

  'node/prefer-global/process': 'off',
  'operator-assignment': ['error', 'always'],

  'style/array-bracket-newline': ['warn', 'consistent'],
  'style/array-element-newline': ['warn', 'consistent'],
  'style/indent': ['error', 2, { CallExpression: { arguments: 'first' } }],
  'style/object-curly-newline': ['warn', { consistent: true }],
  'style/wrap-regex': 'warn',
  'style/padding-line-between-statements': [
    'error',

    ...paddingGroups.flatMap(block => [
      { blankLine: 'always' as const, prev: block, next: '*' as const },
      { blankLine: 'any' as const, prev: block, next: block },
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
}

export const typeAwareRules: Partial<Linter.RulesRecord & Rules> = {
  'ts/strict-boolean-expressions': 'error',
  'ts/no-unsafe-assignment': 'off',
}
