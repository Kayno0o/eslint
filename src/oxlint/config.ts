import type { Linter } from 'eslint'
import type { TypedFlatConfigItem } from '../types'
import type { OxlintPartial, OxlintScope } from './ledger'
import { LEDGER, PARTIALS, toOxlintOptions, toOxlintPlugin, toOxlintRule, toOxlintScope, TYPE_AWARE } from './ledger'

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

const partialPresets = new Set(PARTIALS.map(partial => partial.preset))

const partialRules = new Map(PARTIALS.map(partial => [partial, new Set(partial.rules)]))

const severity = (value: unknown): string => (['off', 'warn', 'error'][Number(value)] ?? String(value))

interface RuleModule {
  meta?: { docs?: { requiresTypeChecking?: boolean } }
}

interface PluginModule {
  rules?: Record<string, RuleModule>
}

/** Alias -> plugin module lookup, built once per scan from every config item's `plugins` field. */
function pluginsIn(configs: TypedFlatConfigItem[]): Map<string, PluginModule> {
  const plugins = new Map<string, PluginModule>()

  for (const config of configs) {
    for (const [alias, plugin] of Object.entries(config.plugins ?? {}))
      plugins.set(alias, plugin as PluginModule)
  }

  return plugins
}

/**
 * Whether `rule` needs a TypeScript program: it sits in the ledger's type-aware handover block, or its own plugin
 * rule declares `meta.docs.requiresTypeChecking`. `plugins` is the alias -> plugin lookup `pluginsIn` builds once.
 */
function isTypeChecked(rule: string, plugins: Map<string, PluginModule>): boolean {
  if (typeAware.has(rule))
    return true

  const slash = rule.indexOf('/')

  if (slash < 0)
    return false

  const ruleModule = plugins.get(rule.slice(0, slash))?.rules?.[rule.slice(slash + 1)]

  return ruleModule?.meta?.docs?.requiresTypeChecking === true
}

const handover = (name?: string): boolean => name === OXLINT_CONFIG_NAME || (name?.startsWith(`${OXLINT_CONFIG_NAME}/`) ?? false)

const ours = (name?: string): boolean => name != null && name.startsWith('kaynooo/') && name !== 'kaynooo/overrides' && !handover(name)

/** Files oxlint never reads: non-JS languages, and the JS our markdown processor extracts from code blocks. */
const UNREAD_BY_OXLINT = /\.md\/|\.(?:md|json5?|jsonc|ya?ml|toml|css|less|s[ac]ss|html?|xml|svg|gql|graphql)$/

function unreadByOxlint(files: TypedFlatConfigItem['files']): boolean {
  const globs = (files ?? []).flat(2)

  return globs.length > 0 && globs.every(glob => UNREAD_BY_OXLINT.test(glob))
}

const partialPreset = (name?: string): boolean => name != null && partialPresets.has(name)

/** The file families oxlint reads only in part that a config turns on. */
const partialsIn = (configs: TypedFlatConfigItem[]): OxlintPartial[] => PARTIALS.filter(partial => configs.some(config => config.name === partial.preset))

/**
 * Effective value of every ledger rule, replaying ESLint's flat config merge (a severity-only entry keeps the
 * options set before it). Rules a consumer config touches are dropped: their scoping and options are not ours to
 * translate, so they stay in ESLint. Config items scoped to files oxlint cannot read are skipped entirely,
 * otherwise a markdown-only `off` would read as a global one.
 * The preset item of a file family oxlint reads only in part is skipped for the same reason.
 */
function resolveLedger(configs: TypedFlatConfigItem[]): Map<string, RuleEntry> {
  const resolved = new Map<string, RuleEntry>()
  const consumerOwned = new Set<string>()

  for (const config of configs) {
    if (handover(config.name) || unreadByOxlint(config.files) || partialPreset(config.name))
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
 * A file family oxlint reads only in part keeps the rules its partial lists.
 * `typeAwareComponents` names the components `filesTypeAware` calls out explicitly: tsgolint never reads them, so
 * the type-aware block stays on in eslint for those alone.
 */
export function oxlintDisables(configs: TypedFlatConfigItem[], typeAwareComponents: string[] = []): TypedFlatConfigItem[] {
  const partials = partialsIn(configs)
  const items = new Map<string, TypedFlatConfigItem & { rules: Linter.RulesRecord }>()

  for (const rule of resolveLedger(configs).keys()) {
    const scope = toOxlintScope(rule)
    const kept = partials.filter(partial => partialRules.get(partial)?.has(rule) === true)
    const exceptComponents = typeAware.has(rule) && typeAwareComponents.length > 0
    const name = [OXLINT_CONFIG_NAME, scope?.name, ...kept.map(partial => `except-${partial.name}`), ...(exceptComponents ? ['except-components'] : [])].filter(part => part != null).join('/')
    const item = items.get(name) ?? {
      name,
      ...(scope == null ? {} : { files: scope.files }),
      ignores: ['**/*.md/**', ...kept.flatMap(partial => partial.files), ...(exceptComponents ? typeAwareComponents : [])],
      rules: {},
    }

    item.rules[rule] = 'off'
    items.set(name, item)
  }

  return [...items.values()]
}

/**
 * Parser items giving the type-aware parser's projectService to exactly the components a consumer's own live type-aware rule reaches, each item's files scoped to the intersection so an untouched component is never asked for.
 * Skips the config items `ours` already claims for the preset, so only a consumer's own rule contributes.
 */
export function componentTypeAwareParsers(configs: TypedFlatConfigItem[], parserItem: TypedFlatConfigItem | undefined, componentGlobs: string[]): TypedFlatConfigItem[] {
  if (parserItem == null || componentGlobs.length === 0)
    return []

  const parserOptions = parserItem.languageOptions?.parserOptions
  const plugins = pluginsIn(configs)
  const items: TypedFlatConfigItem[] = []

  for (const config of configs) {
    if (handover(config.name) || ours(config.name))
      continue

    const live = Object.entries(config.rules ?? {}).some(([rule, value]) => isTypeChecked(rule, plugins) && severity(Array.isArray(value) ? value[0] : value) !== 'off')

    if (!live)
      continue

    const configFiles = config.files
    const files = configFiles == null
      ? [...componentGlobs]
      : componentGlobs.flatMap(glob => configFiles.map(entry => [glob, ...(Array.isArray(entry) ? entry : [entry])]))

    items.push({
      name: items.length === 0 ? `${TYPE_AWARE_PARSER_NAME}/components` : `${TYPE_AWARE_PARSER_NAME}/components/${items.length}`,
      files,
      ...(config.ignores == null ? {} : { ignores: config.ignores }),
      ...(config.basePath == null ? {} : { basePath: config.basePath }),
      languageOptions: { parserOptions },
    })
  }

  return items
}

/**
 * A config item's scope for `needsTypeInformation`'s liveness tracking: its `files`, plus its `ignores` without the
 * markdown-code-block entry every type-aware item carries.
 */
function typeAwareScopeKey(config: TypedFlatConfigItem): string {
  const ignores = (config.ignores ?? []).filter(glob => glob !== '**/*.md/**')

  return JSON.stringify({ files: config.files ?? null, ignores })
}

/** An `off` with no `files` and no ignores beyond the markdown one applies everywhere, so it kills every scope. */
function isUnscopedOff(config: TypedFlatConfigItem): boolean {
  return config.files == null && (config.ignores ?? []).every(glob => glob === '**/*.md/**')
}

/**
 * Whether ESLint still runs a rule that needs type information. Config items scoped to files oxlint cannot read are
 * skipped, so a markdown-only `off` does not read as a global one. Liveness is tracked per rule and scope, so a
 * scoped `off` - a consumer's own, or the one excluding a component named in `filesTypeAware` - only kills the
 * entry sharing its exact scope, while an unscoped `off` kills every entry for the rule.
 */
export function needsTypeInformation(configs: TypedFlatConfigItem[]): boolean {
  const plugins = pluginsIn(configs)
  const live = new Map<string, Set<string>>()

  for (const config of configs) {
    if (unreadByOxlint(config.files))
      continue

    for (const [rule, value] of Object.entries(config.rules ?? {})) {
      if (!isTypeChecked(rule, plugins))
        continue

      const off = severity(Array.isArray(value) ? value[0] : value) === 'off'

      if (off && isUnscopedOff(config)) {
        live.delete(rule)

        continue
      }

      const scopes = live.get(rule) ?? new Set<string>()

      if (off)
        scopes.delete(typeAwareScopeKey(config))
      else
        scopes.add(typeAwareScopeKey(config))

      if (scopes.size === 0)
        live.delete(rule)
      else
        live.set(rule, scopes)
    }
  }

  return live.size > 0
}

/** Whether a generated config needs `--type-aware`, which costs oxlint a `tsgolint` pass. */
export function isTypeAware(config: OxlintConfig): boolean {
  return TYPE_AWARE.some(rule => config.rules[toOxlintRule(rule)] != null)
}

/** Arguments running oxlint on a generated config. A file list with nothing oxlint reads, such as a commit touching only JSON, is left to ESLint instead of failing the run. */
export function oxlintArgs(configPath: string, typeAware: boolean): string[] {
  return ['--config', configPath, '--no-error-on-unmatched-pattern', ...(typeAware ? ['--type-aware'] : [])]
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

  // A file family oxlint reads only in part turns off the rules ESLint keeps for it, so only ESLint reports them there.
  const kept: OxlintOverride[] = partialsIn(configs)
    .map(partial => ({ files: partial.files, rules: Object.fromEntries(partial.rules.filter(rule => resolved.has(rule)).map(rule => [toOxlintRule(rule), 'off'])) }))
    .filter(override => Object.keys(override.rules).length > 0)
  const allOverrides = [...overrides.values(), ...kept]

  return {
    categories: { correctness: 'off' },
    plugins: [...plugins].sort(),
    rules,
    ...(allOverrides.length === 0 ? {} : { overrides: allOverrides }),
  }
}
