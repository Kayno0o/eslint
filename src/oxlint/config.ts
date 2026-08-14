import type { Linter } from 'eslint'
import type { TypedFlatConfigItem } from '../types'
import { LEDGER, toOxlintOptions, toOxlintPlugin, toOxlintRule } from './ledger'

/** Name of the flat config item that hands the ledger over to oxlint. Its presence is what tells the bin to run oxlint. */
export const OXLINT_CONFIG_NAME = 'kaynooo/oxlint'

export interface OxlintConfig {
  categories: Record<string, string>
  plugins: string[]
  rules: Record<string, string | [string, ...unknown[]]>
}

type RuleEntry = [severity: string, ...options: unknown[]]

const ledger = new Set(LEDGER)

const severity = (value: unknown): string => (['off', 'warn', 'error'][Number(value)] ?? String(value))

const ours = (name?: string): boolean => name != null && name.startsWith('kaynooo/') && name !== 'kaynooo/overrides' && name !== OXLINT_CONFIG_NAME

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
    if (config.name === OXLINT_CONFIG_NAME || unreadByOxlint(config.files))
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

/** Flat config item turning the ledger off in ESLint. Markdown code blocks keep them, since oxlint does not read `.md`. */
export function oxlintDisables(configs: TypedFlatConfigItem[]): TypedFlatConfigItem | undefined {
  const resolved = resolveLedger(configs)

  if (resolved.size === 0)
    return undefined

  const rules: Linter.RulesRecord = {}

  for (const rule of resolved.keys())
    rules[rule] = 'off'

  return { name: OXLINT_CONFIG_NAME, ignores: ['**/*.md/**'], rules }
}

/** Build the `.oxlintrc.json` matching a resolved ESLint config. Returns nothing when the config kept every rule in ESLint. */
export function buildOxlintConfig(configs: TypedFlatConfigItem[]): OxlintConfig | undefined {
  if (!configs.some(config => config.name === OXLINT_CONFIG_NAME))
    return undefined

  const resolved = resolveLedger(configs)

  if (resolved.size === 0)
    return undefined

  const plugins = new Set<string>()
  const rules: OxlintConfig['rules'] = {}

  for (const [rule, [level, ...options]] of [...resolved].sort(([a], [b]) => a.localeCompare(b))) {
    const translated = toOxlintOptions(rule, options)

    plugins.add(toOxlintPlugin(rule))
    rules[toOxlintRule(rule)] = translated.length === 0 ? level : [level, ...translated]
  }

  return { categories: { correctness: 'off' }, plugins: [...plugins].sort(), rules }
}
