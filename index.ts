import antfu from '@antfu/eslint-config'
import github from 'eslint-plugin-github'

export const typescript = antfu({
  plugins: {
    github,
  },
  typescript: true,
  rules: {
    // default
    'no-empty-function': 'off',
    'node/prefer-global/process': 'off',
    'style/array-bracket-newline': ['warn', 'consistent'],
    'style/array-element-newline': ['warn', 'consistent'],
    'style/object-curly-newline': ['warn', { consistent: true }],
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
    'github/no-then': 'error',
    'github/array-foreach': 'error',
    'operator-assignment': ['error', 'always'],
    'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
    'no-else-return': ['error', { allowElseIf: false }],
    // other
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
    'unicorn/no-new-array': 'off',
    'no-implicit-coercion': ['error', { number: true, boolean: true, string: true, disallowTemplateShorthand: true }],
    'new-cap': ['error'],
  },
})

export const vue = antfu({
  plugins: {
    github,
  },
  typescript: true,
  vue: true,
  formatters: {
    css: true,
  },
  rules: {
    // default
    'no-empty-function': 'off',
    'node/prefer-global/process': 'off',
    'style/array-bracket-newline': ['warn', 'consistent'],
    'style/array-element-newline': ['warn', 'consistent'],
    'style/object-curly-newline': ['warn', { consistent: true }],
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
    'github/no-then': 'error',
    'github/array-foreach': 'error',
    'operator-assignment': ['error', 'always'],
    'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
    'no-else-return': ['error', { allowElseIf: false }],
    // other
    'vue/max-attributes-per-line': ['error', { multiline: { max: 1 }, singleline: { max: 3 } }],
  },
})

export default {
  typescript,
}
