import type { TypedFlatConfigItem } from '../types'
import process from 'node:process'
import { interopDefault } from '../plugins'

const files = ['**/*.?([cm])ts', '**/*.?([cm])tsx']
const filesJs = ['**/*.?([cm])js', '**/*.?([cm])jsx']
const ignoresMarkdownCode = ['**/*.md/**']

export interface TypescriptOptions {
  strict?: boolean
  tsconfigPath?: string
  filesTypeAware?: string[]
}

export async function typescript(options: TypescriptOptions = {}): Promise<TypedFlatConfigItem[]> {
  const { strict = false, tsconfigPath, filesTypeAware = files } = options
  const [parserTs, pluginAntfu, pluginTs] = await Promise.all([
    interopDefault(import('@typescript-eslint/parser')),
    interopDefault(import('eslint-plugin-antfu')),
    interopDefault(import('@typescript-eslint/eslint-plugin')),
  ])
  const configs: TypedFlatConfigItem[] = [
    {
      name: 'kaynooo/typescript/setup',
      plugins: { antfu: pluginAntfu, ts: pluginTs },
    },
    {
      name: 'kaynooo/typescript/parser',
      files,
      languageOptions: {
        parser: parserTs,
        parserOptions: { extraFileExtensions: [], sourceType: 'module' },
      },
    },
    {
      // `unused-imports/no-unused-vars` is typescript-eslint's rule, which reads `isValueReference` off the references of its scope manager: under espree's, every read of a variable counts as a type-only use.
      name: 'kaynooo/typescript/parser-js',
      files: filesJs,
      ignores: ignoresMarkdownCode,
      languageOptions: {
        parser: parserTs,
        parserOptions: { sourceType: 'module' },
      },
    },
    {
      name: 'kaynooo/typescript/rules',
      files,
      rules: {
        'constructor-super': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-args': 'off',
        'no-dupe-class-members': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-obj-calls': 'off',
        'no-redeclare': 'off',
        'no-this-before-super': 'off',
        'no-undef': 'off',
        'no-unreachable': 'off',
        'no-unsafe-negation': 'off',
        'no-with': 'off',
        'ts/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
          },
        ],
        'no-array-constructor': 'off',
        'ts/no-array-constructor': 'error',
        'ts/no-duplicate-enum-values': 'error',
        'ts/no-empty-object-type': [
          'error',
          {
            allowInterfaces: 'always',
          },
        ],
        'ts/no-extra-non-null-assertion': 'error',
        'ts/no-misused-new': 'error',
        'ts/no-namespace': 'error',
        'ts/no-non-null-asserted-nullish-coalescing': 'error',
        'ts/no-non-null-asserted-optional-chain': 'error',
        'ts/no-require-imports': 'error',
        'ts/no-this-alias': 'error',
        'ts/no-unnecessary-type-constraint': 'error',
        'ts/no-unsafe-declaration-merging': 'error',
        'ts/no-unsafe-function-type': 'error',
        'no-unused-expressions': 'off',
        'ts/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTaggedTemplates: true,
            allowTernary: true,
          },
        ],
        'no-unused-vars': 'off',
        'no-useless-constructor': 'off',
        'ts/no-wrapper-object-types': 'error',
        'ts/prefer-as-const': 'error',
        'ts/prefer-literal-enum-member': 'error',
        'ts/prefer-namespace-keyword': 'error',
        'no-use-before-define': 'off',
        'ts/consistent-type-definitions': [
          'error',
          'interface',
        ],
        'ts/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        'ts/method-signature-style': [
          'error',
          'property',
        ],
        'ts/no-import-type-side-effects': 'error',
        'ts/no-use-before-define': [
          'error',
          {
            classes: false,
            functions: false,
            variables: true,
          },
        ],
        'ts/adjacent-overload-signatures': 'error',
        'ts/array-type': 'error',
        'ts/ban-tslint-comment': 'error',
        'ts/class-literal-property-style': 'error',
        'ts/consistent-generic-constructors': 'error',
        'ts/consistent-indexed-object-style': 'error',
        'ts/no-confusing-non-null-assertion': 'error',
        'ts/no-empty-function': 'error',
        'ts/no-inferrable-types': 'error',
        'ts/prefer-for-of': 'error',
        'ts/prefer-function-type': 'error',
      },
    },
  ]

  if (strict && tsconfigPath != null && tsconfigPath !== '') {
    configs.push(
      {
        name: 'kaynooo/typescript/type-aware-parser',
        files: filesTypeAware,
        ignores: ignoresMarkdownCode,
        languageOptions: {
          parser: parserTs,
          parserOptions: {
            extraFileExtensions: [],
            sourceType: 'module',
            projectService: { allowDefaultProject: ['./*.js'], defaultProject: tsconfigPath },
            tsconfigRootDir: process.cwd(),
          },
        },
      },
      {
        name: 'kaynooo/typescript/rules-type-aware',
        files: filesTypeAware,
        ignores: ignoresMarkdownCode,
        rules: {
          'dot-notation': 'off',
          'no-implied-eval': 'off',
          'ts/await-thenable': 'error',
          'ts/dot-notation': [
            'error',
            {
              allowKeywords: true,
            },
          ],
          'ts/no-floating-promises': 'error',
          'ts/no-for-in-array': 'error',
          'ts/no-implied-eval': 'error',
          'ts/no-misused-promises': 'error',
          'ts/no-unnecessary-type-assertion': 'error',
          'ts/no-unsafe-argument': 'error',
          'ts/no-unsafe-call': 'error',
          'ts/no-unsafe-member-access': 'error',
          'ts/no-unsafe-return': 'error',
          'ts/promise-function-async': 'error',
          'ts/restrict-plus-operands': 'error',
          'ts/restrict-template-expressions': 'error',
          'ts/return-await': [
            'error',
            'in-try-catch',
          ],
          'ts/strict-boolean-expressions': [
            'error',
            {
              allowNullableBoolean: true,
              allowNullableObject: true,
            },
          ],
          'ts/switch-exhaustiveness-check': 'error',
          'ts/unbound-method': 'error',
        },
      },
    )
  }

  return configs
}
