/**
 * Rules handed over to oxlint. Every name here is turned off in ESLint and enabled in the generated
 * `.oxlintrc.json`, so a name only belongs here once oxlint reports the same thing ESLint did.
 *
 * Excluded on purpose:
 * - rules our presets enable for JS but disable for TS (`no-redeclare`, `no-unused-vars`, ...) - oxlint has no such
 *   split, and `no-undef` would need our `languageOptions.globals` translated with it
 * - type-aware rules - they need `oxlint-tsgolint`
 */
export const LEDGER: string[] = [
  'accessor-pairs',
  'array-callback-return',
  'block-scoped-var',
  'default-case-last',
  'eqeqeq',
  'logical-assignment-operators',
  'new-cap',
  'no-alert',
  'no-async-promise-executor',
  'no-caller',
  'no-case-declarations',
  'no-compare-neg-zero',
  'no-cond-assign',
  'no-control-regex',
  'no-debugger',
  'no-delete-var',
  'no-duplicate-case',
  'no-else-return',
  'no-empty',
  'no-empty-pattern',
  'no-eval',
  'no-ex-assign',
  'no-extend-native',
  'no-extra-bind',
  'no-extra-boolean-cast',
  'no-fallthrough',
  'no-global-assign',
  'no-implicit-coercion',
  'no-irregular-whitespace',
  'no-iterator',
  'no-labels',
  'no-lone-blocks',
  'no-lonely-if',
  'no-loss-of-precision',
  'no-misleading-character-class',
  'no-multi-str',
  'no-new',
  'no-new-func',
  'no-new-wrappers',
  'no-proto',
  'no-prototype-builtins',
  'no-regex-spaces',
  'no-restricted-globals',
  'no-restricted-properties',
  'no-self-assign',
  'no-self-compare',
  'no-sequences',
  'no-shadow-restricted-names',
  'no-sparse-arrays',
  'no-template-curly-in-string',
  'no-throw-literal',
  'no-unexpected-multiline',
  'no-unmodified-loop-condition',
  'no-unneeded-ternary',
  'no-unreachable-loop',
  'no-unsafe-finally',
  'no-unsafe-optional-chaining',
  'no-useless-call',
  'no-useless-catch',
  'no-useless-computed-key',
  'no-useless-escape',
  'no-useless-rename',
  'no-useless-return',
  'no-var',
  'object-shorthand',
  'one-var',
  'operator-assignment',
  'prefer-arrow-callback',
  'prefer-const',
  'prefer-exponentiation-operator',
  'prefer-promise-reject-errors',
  'prefer-regex-literals',
  'prefer-rest-params',
  'prefer-spread',
  'prefer-template',
  'symbol-description',
  'unicode-bom',
  'use-isnan',
  'valid-typeof',
  'vars-on-top',
  'yoda',

  'import/consistent-type-specifier-style',
  'import/first',
  'import/newline-after-import',
  'import/no-duplicates',
  'import/no-mutable-exports',
  'import/no-named-default',

  'jsdoc/check-access',
  'jsdoc/check-property-names',
  'jsdoc/empty-tags',
  'jsdoc/implements-on-classes',
  'jsdoc/no-defaults',
  'jsdoc/require-param-name',
  'jsdoc/require-property',
  'jsdoc/require-property-description',
  'jsdoc/require-property-name',
  'jsdoc/require-returns-description',

  'jsx-a11y/alt-text',
  'jsx-a11y/anchor-ambiguous-text',
  'jsx-a11y/anchor-has-content',
  'jsx-a11y/anchor-is-valid',
  'jsx-a11y/aria-activedescendant-has-tabindex',
  'jsx-a11y/aria-props',
  'jsx-a11y/aria-proptypes',
  'jsx-a11y/aria-role',
  'jsx-a11y/aria-unsupported-elements',
  'jsx-a11y/autocomplete-valid',
  'jsx-a11y/click-events-have-key-events',
  'jsx-a11y/heading-has-content',
  'jsx-a11y/html-has-lang',
  'jsx-a11y/iframe-has-title',
  'jsx-a11y/img-redundant-alt',
  'jsx-a11y/interactive-supports-focus',
  'jsx-a11y/label-has-associated-control',
  'jsx-a11y/lang',
  'jsx-a11y/media-has-caption',
  'jsx-a11y/mouse-events-have-key-events',
  'jsx-a11y/no-access-key',
  'jsx-a11y/no-aria-hidden-on-focusable',
  'jsx-a11y/no-autofocus',
  'jsx-a11y/no-distracting-elements',
  'jsx-a11y/no-interactive-element-to-noninteractive-role',
  'jsx-a11y/no-noninteractive-element-interactions',
  'jsx-a11y/no-noninteractive-element-to-interactive-role',
  'jsx-a11y/no-noninteractive-tabindex',
  'jsx-a11y/no-redundant-roles',
  'jsx-a11y/no-static-element-interactions',
  'jsx-a11y/prefer-tag-over-role',
  'jsx-a11y/role-has-required-aria-props',
  'jsx-a11y/role-supports-aria-props',
  'jsx-a11y/scope',
  'jsx-a11y/tabindex-no-positive',

  'ts/adjacent-overload-signatures',
  'ts/array-type',
  'ts/ban-ts-comment',
  'ts/ban-tslint-comment',
  'ts/class-literal-property-style',
  'ts/consistent-generic-constructors',
  'ts/consistent-indexed-object-style',
  'ts/consistent-type-definitions',
  'ts/consistent-type-imports',
  'ts/method-signature-style',
  'ts/no-array-constructor',
  'ts/no-confusing-non-null-assertion',
  'ts/no-dupe-class-members',
  'ts/no-duplicate-enum-values',
  'ts/no-empty-function',
  'ts/no-empty-object-type',
  'ts/no-extra-non-null-assertion',
  'ts/no-import-type-side-effects',
  'ts/no-inferrable-types',
  'ts/no-misused-new',
  'ts/no-namespace',
  'ts/no-non-null-asserted-nullish-coalescing',
  'ts/no-non-null-asserted-optional-chain',
  'ts/no-redeclare',
  'ts/no-require-imports',
  'ts/no-this-alias',
  'ts/no-unnecessary-type-constraint',
  'ts/no-unsafe-declaration-merging',
  'ts/no-unsafe-function-type',
  'ts/no-unused-expressions',
  'ts/no-use-before-define',
  'ts/no-wrapper-object-types',
  'ts/prefer-as-const',
  'ts/prefer-for-of',
  'ts/prefer-function-type',
  'ts/prefer-literal-enum-member',
  'ts/prefer-namespace-keyword',

  'unicorn/consistent-empty-array-spread',
  'unicorn/error-message',
  'unicorn/escape-case',
  'unicorn/new-for-builtins',
  'unicorn/no-instanceof-builtins',
  'unicorn/no-new-buffer',
  'unicorn/no-useless-fallback-in-spread',
  'unicorn/no-useless-length-check',
  'unicorn/no-useless-spread',
  'unicorn/number-literal-case',
  'unicorn/prefer-dom-node-text-content',
  'unicorn/prefer-includes',
  'unicorn/prefer-node-protocol',
  'unicorn/prefer-number-properties',
  'unicorn/prefer-string-starts-ends-with',
  'unicorn/prefer-type-error',
  'unicorn/throw-new-error',
]

/** Our plugin aliases mapped onto the oxlint plugin that implements them. */
const PLUGIN_ALIASES: Record<string, string> = {
  ts: 'typescript',
}

export interface OxlintScope {
  name: string
  files: string[]
}

/**
 * Rules our presets enable for part of the tree only. Both linters are held to the globs below, so a file oxlint
 * skips keeps the rule in ESLint. Extglobs are out: oxlint matches `overrides.files` literally.
 */
const SCOPES: [prefix: string, scope: OxlintScope][] = [
  ['jsx-a11y/', { name: 'jsx', files: ['**/*.jsx', '**/*.tsx'] }],
]

export function toOxlintScope(rule: string): OxlintScope | undefined {
  return SCOPES.find(([prefix]) => rule.startsWith(prefix))?.[1]
}

/** Rule options ESLint and oxlint spell differently. */
const OPTION_TRANSLATIONS: Record<string, (options: unknown[]) => unknown[]> = {
  'import/consistent-type-specifier-style': ([style]) => [style === 'inline' ? 'prefer-inline' : 'prefer-top-level'],
}

export function toOxlintRule(rule: string): string {
  const slash = rule.indexOf('/')

  if (slash < 0)
    return rule

  const plugin = rule.slice(0, slash)

  return `${PLUGIN_ALIASES[plugin] ?? plugin}/${rule.slice(slash + 1)}`
}

export function toOxlintOptions(rule: string, options: unknown[]): unknown[] {
  return options.length === 0 ? options : (OPTION_TRANSLATIONS[rule]?.(options) ?? options)
}

export function toOxlintPlugin(rule: string): string {
  const slash = rule.indexOf('/')

  return slash < 0 ? 'eslint' : (PLUGIN_ALIASES[rule.slice(0, slash)] ?? rule.slice(0, slash))
}
