import type { TypedFlatConfigItem } from '../types'
import process from 'node:process'
import { TYPE_AWARE_PARSER_NAME } from '../oxlint/config'
import { interopDefault } from '../plugins'

const files = ['**/*.?([cm])ts', '**/*.?([cm])tsx']
const ignoresMarkdownCode = ['**/*.md/**']
const astroGlob = /\.astro$/

export interface TypescriptOptions {
  strict?: boolean
  tsconfigPath?: string
  filesTypeAware?: string[]
  /** Component extensions, such as `svelte`, whose scripts get the TypeScript rules as well. */
  componentExts?: string[]
}

export async function typescript(options: TypescriptOptions = {}): Promise<TypedFlatConfigItem[]> {
  const { strict = false, tsconfigPath, filesTypeAware = files, componentExts = [] } = options
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
      name: 'kaynooo/typescript/rules',
      files: [...files, ...componentExts.map(ext => `**/*.${ext}`)],
      rules: {
        'constructor-super': 'off',
        'getter-return': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-args': 'off',
        'no-dupe-class-members': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-new-symbol': 'off',
        'no-obj-calls': 'off',
        'no-redeclare': 'off',
        'no-setter-return': 'off',
        'no-this-before-super': 'off',
        'no-undef': 'off',
        'no-unreachable': 'off',
        'no-unsafe-negation': 'off',
        'no-var': 'error',
        'no-with': 'off',
        'prefer-const': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'ts/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
          },
        ],
        'no-array-constructor': 'off',
        'ts/no-array-constructor': 'error',
        'ts/no-duplicate-enum-values': 'error',
        'ts/no-dynamic-delete': 'off',
        'ts/no-empty-object-type': [
          'error',
          {
            allowInterfaces: 'always',
          },
        ],
        'ts/no-explicit-any': 'off',
        'ts/no-extra-non-null-assertion': 'error',
        'ts/no-extraneous-class': 'off',
        'ts/no-invalid-void-type': 'off',
        'ts/no-misused-new': 'error',
        'ts/no-namespace': 'error',
        'ts/no-non-null-asserted-nullish-coalescing': 'error',
        'ts/no-non-null-asserted-optional-chain': 'error',
        'ts/no-non-null-assertion': 'off',
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
        'ts/no-unused-vars': 'off',
        'no-useless-constructor': 'off',
        'ts/no-useless-constructor': 'off',
        'ts/no-wrapper-object-types': 'error',
        'ts/prefer-as-const': 'error',
        'ts/prefer-literal-enum-member': 'error',
        'ts/prefer-namespace-keyword': 'error',
        'ts/triple-slash-reference': 'off',
        'ts/unified-signatures': 'off',
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
        'ts/no-dupe-class-members': 'error',
        'ts/no-import-type-side-effects': 'error',
        'ts/no-redeclare': [
          'error',
          {
            builtinGlobals: false,
          },
        ],
        'ts/no-use-before-define': [
          'error',
          {
            classes: false,
            functions: false,
            variables: true,
          },
        ],
      },
    },
  ]

  if (strict && tsconfigPath != null && tsconfigPath !== '') {
    const astroFilesTypeAware = filesTypeAware.filter(glob => astroGlob.test(glob))

    configs.push(
      {
        name: TYPE_AWARE_PARSER_NAME,
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
      // `astro-eslint-parser` warns and falls back to `project: true` on `projectService`, which drops `tsconfigRootDir`: give `.astro` `project` directly instead. Placed before the astro preset's own item, so its `extraFileExtensions` and inner parser still win the merge.
      ...(astroFilesTypeAware.length === 0
        ? []
        : [{
          name: `${TYPE_AWARE_PARSER_NAME}/astro`,
          files: astroFilesTypeAware,
          ignores: ignoresMarkdownCode,
          languageOptions: {
            parserOptions: {
              projectService: false,
              project: tsconfigPath,
              tsconfigRootDir: process.cwd(),
            },
          },
        }]),
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
          'ts/no-unsafe-assignment': 'error',
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
