import type { Linter } from 'eslint'
import type { TypedFlatConfigItem } from '../types'
import type { OxlintScope } from './ledger'
import { LEDGER, toOxlintOptions, toOxlintPlugin, toOxlintRule, toOxlintScope, TYPE_AWARE } from './ledger'

/** Name of the parser config item that builds the TypeScript program ESLint's type-aware rules read. */
export const TYPE_AWARE_PARSER_NAME = 'kaynooo/typescript/type-aware-parser'

/** Name the flat config items handing the ledger over to oxlint share. Their presence is what tells the bin to run oxlint. */
export const OXLINT_CONFIG_NAME = 'kaynooo/oxlint'

export interface OxlintOverride {
  files: string[]
  rules: OxlintConfig['rules']
}

export interface OxlintConfig {
  categories: Record<string, string>
  plugins: string[]
  rules: Record<string, string | [string, ...unknown[]]>
  overrides?: OxlintOverride[]
}

type RuleEntry = [severity: string, ...options: unknown[]]

const ledger = new Set(LEDGER)

const typeAware = new Set(TYPE_AWARE)

const severity = (value: unknown): string => (['off', 'warn', 'error'][Number(value)] ?? String(value))

const handover = (name?: string): boolean => name === OXLINT_CONFIG_NAME || (name?.startsWith(`${OXLINT_CONFIG_NAME}/`) ?? false)

const ours = (name?: string): boolean => name != null && name.startsWith('kaynooo/') && name !== 'kaynooo/overrides' && !handover(name)

/** Files oxlint never reads: non-JS languages, and the JS our markdown processor extracts from code blocks. */
const UNREAD_BY_OXLINT = /\.md\/|\.(?:md|json5?|jsonc|ya?ml|toml|css|less|s[ac]ss|html?|xml|svg|gql|graphql)$/

function unreadByOxlint(files: TypedFlatConfigItem['files']): boolean {
  const globs = (files ?? []).flat(2)

  return globs.length > 0 && globs.every(glob => UNREAD_BY_OXLINT.test(glob))
}

/**
 * Effective value of every ledger rule, replaying ESLint's flat config merge (a severity-only entry keeps the
 * options set before it). Rules a consumer config touches are dropped: their scoping and options are not ours to
 * translate, so they stay in ESLint. Config items scoped to files oxlint cannot read are skipped entirely,
 * otherwise a markdown-only `off` would read as a global one.
 */
function resolveLedger(configs: TypedFlatConfigItem[]): Map<string, RuleEntry> {
  const resolved = new Map<string, RuleEntry>()
  const consumerOwned = new Set<string>()

  for (const config of configs) {
    if (handover(config.name) || unreadByOxlint(config.files))
      continue

    for (const [rule, value] of Object.entries(config.rules ?? {})) {
      if (!ledger.has(rule))
        continue

      if (!ours(config.name)) {
        consumerOwned.add(rule)

        continue
      }

      const entry = (Array.isArray(value) ? value : [value]) as RuleEntry
      const options = entry.length > 1 ? entry.slice(1) : (resolved.get(rule)?.slice(1) ?? [])

      resolved.set(rule, [severity(entry[0]), ...options])
    }
  }

  for (const rule of consumerOwned)
    resolved.delete(rule)

  for (const [rule, [level]] of resolved) {
    if (level === 'off')
      resolved.delete(rule)
  }

  return resolved
}

/**
 * Flat config items turning the ledger off in ESLint, one per scope so a rule only goes quiet where oxlint picks it
 * up. Markdown code blocks keep them all, since oxlint does not read `.md`.
 */
export function oxlintDisables(configs: TypedFlatConfigItem[]): TypedFlatConfigItem[] {
  const scoped = new Map<OxlintScope | undefined, Linter.RulesRecord>()

  for (const rule of resolveLedger(configs).keys()) {
    const scope = toOxlintScope(rule)
    const rules = scoped.get(scope) ?? {}

    rules[rule] = 'off'
    scoped.set(scope, rules)
  }

  return [...scoped].map(([scope, rules]) => ({
    name: scope == null ? OXLINT_CONFIG_NAME : `${OXLINT_CONFIG_NAME}/${scope.name}`,
    ...(scope == null ? {} : { files: scope.files }),
    ignores: ['**/*.md/**'],
    rules,
  }))
}

/**
 * Whether ESLint still runs a rule that needs type information. Config items scoped to files oxlint cannot read are
 * skipped, so a markdown-only `off` does not read as a global one.
 */
export function needsTypeInformation(configs: TypedFlatConfigItem[]): boolean {
  const live = new Set<string>()

  for (const config of configs) {
    if (unreadByOxlint(config.files))
      continue

    for (const [rule, value] of Object.entries(config.rules ?? {})) {
      if (!typeAware.has(rule))
        continue

      if (severity(Array.isArray(value) ? value[0] : value) === 'off')
        live.delete(rule)
      else
        live.add(rule)
    }
  }

  return live.size > 0
}

/** Whether a generated config needs `--type-aware`, which costs oxlint a `tsgolint` pass. */
export function isTypeAware(config: OxlintConfig): boolean {
  return TYPE_AWARE.some(rule => config.rules[toOxlintRule(rule)] != null)
}

/** Build the `.oxlintrc.json` matching a resolved ESLint config. Returns nothing when the config kept every rule in ESLint. */
export function buildOxlintConfig(configs: TypedFlatConfigItem[]): OxlintConfig | undefined {
  if (!configs.some(config => handover(config.name)))
    return undefined

  const resolved = resolveLedger(configs)

  if (resolved.size === 0)
    return undefined

  const plugins = new Set<string>()
  const rules: OxlintConfig['rules'] = {}
  const overrides = new Map<OxlintScope, OxlintOverride>()

  for (const [rule, [level, ...options]] of [...resolved].sort(([a], [b]) => a.localeCompare(b))) {
    const translated = toOxlintOptions(rule, options)
    const entry: string | [string, ...unknown[]] = translated.length === 0 ? level : [level, ...translated]
    const scope = toOxlintScope(rule)

    plugins.add(toOxlintPlugin(rule))

    if (scope == null) {
      rules[toOxlintRule(rule)] = entry

      continue
    }

    const override = overrides.get(scope) ?? { files: scope.files, rules: {} }

    override.rules[toOxlintRule(rule)] = entry
    overrides.set(scope, override)
  }

  return {
    categories: { correctness: 'off' },
    plugins: [...plugins].sort(),
    rules,
    ...(overrides.size === 0 ? {} : { overrides: [...overrides.values()] }),
  }
}
