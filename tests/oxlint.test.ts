import type { TypedFlatConfigItem } from '../src/types'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { describe, expect, it } from 'bun:test'
import { defineConfig } from '../src/factory'
import { buildOxlintConfig, isTypeAware, OXLINT_CONFIG_NAME, oxlintArgs, TYPE_AWARE_PARSER_NAME } from '../src/oxlint/config'
import { LEDGER, TYPE_AWARE } from '../src/oxlint/ledger'

/** `ts/x` rules our presets configure whose own plugin metadata says they need type information. */
function typeCheckedRulesConfigured(configs: TypedFlatConfigItem[]): string[] {
  const configured = new Set<string>()

  for (const config of configs) {
    for (const rule of Object.keys(config.rules ?? {}))
      configured.add(rule)
  }

  return [...configured].filter((rule) => {
    const slash = rule.indexOf('/')

    if (slash < 0 || rule.slice(0, slash) !== 'ts')
      return false

    return (tsPlugin.rules as Record<string, { meta?: { docs?: { requiresTypeChecking?: boolean } } }>)[rule.slice(slash + 1)]?.meta?.docs?.requiresTypeChecking === true
  })
}

const handoff = (configs: TypedFlatConfigItem[]) => configs.find(config => config.name === OXLINT_CONFIG_NAME)
const handoffs = (configs: TypedFlatConfigItem[]) => configs.filter(config => config.name?.startsWith(OXLINT_CONFIG_NAME))
const disabled = (configs: TypedFlatConfigItem[]) => handoffs(configs).flatMap(config => Object.keys(config.rules ?? {}))

describe('ledger handoff', () => {
  it('turns the handed-over rules off in eslint and on in oxlint', async () => {
    const configs = await defineConfig({ strict: true, a11y: true })
    const off = disabled(configs)
    const oxlint = buildOxlintConfig(configs)
    const on = [...Object.keys(oxlint?.rules ?? {}), ...(oxlint?.overrides ?? []).flatMap(o => Object.keys(o.rules))]

    expect(off.length).toBeGreaterThan(0)
    expect(handoffs(configs).flatMap(config => Object.values(config.rules ?? {}))).toEqual(off.map(() => 'off'))
    expect(on).toHaveLength(off.length)
    expect(off.every(rule => LEDGER.includes(rule))).toBe(true)
  })

  it('keeps markdown code blocks on eslint', async () => {
    const configs = await defineConfig({ a11y: true })

    expect(handoffs(configs)).not.toBeEmpty()
    expect(handoffs(configs).every(config => config.ignores?.includes('**/*.md/**'))).toBe(true)
  })

  it('limits the a11y rules to jsx on both sides', async () => {
    const configs = await defineConfig({ a11y: true })
    const scoped = configs.find(config => config.name === `${OXLINT_CONFIG_NAME}/jsx`)
    const override = buildOxlintConfig(configs)?.overrides?.[0]

    expect(scoped?.files).toEqual(['**/*.jsx', '**/*.tsx'])
    expect(Object.keys(scoped?.rules ?? {}).every(rule => rule.startsWith('jsx-a11y/'))).toBe(true)
    expect(override?.files).toEqual(['**/*.jsx', '**/*.tsx'])
    expect(override?.rules['jsx-a11y/alt-text']).toBe('error')
    expect(buildOxlintConfig(configs)?.rules['jsx-a11y/alt-text']).toBeUndefined()
  })

  it('leaves the a11y rules alone when a11y is off', async () => {
    const configs = await defineConfig()

    expect(configs.find(config => config.name === `${OXLINT_CONFIG_NAME}/jsx`)).toBeUndefined()
    expect(buildOxlintConfig(configs)?.overrides).toBeUndefined()
  })

  it('carries the options eslint resolved, not the rule defaults', async () => {
    const oxlint = buildOxlintConfig(await defineConfig())

    expect(oxlint?.rules['new-cap']).toEqual(['error', { capIsNew: false, newIsCap: true, properties: true }])
  })

  it('translates rule names and options oxlint spells differently', async () => {
    const oxlint = buildOxlintConfig(await defineConfig())

    expect(oxlint?.rules['typescript/no-inferrable-types']).toBe('error')
    expect(oxlint?.rules['ts/no-inferrable-types']).toBeUndefined()
    expect(oxlint?.rules['import/consistent-type-specifier-style']).toEqual(['error', 'prefer-top-level'])
  })

  it('disables oxlint default categories so both linters run the same set', async () => {
    const oxlint = buildOxlintConfig(await defineConfig())

    expect(oxlint?.categories).toEqual({ correctness: 'off' })
  })
})

describe('type-aware handover', () => {
  it('drops the parser that builds a typescript program', async () => {
    const configs = await defineConfig({ strict: true })

    expect(configs.find(config => config.name === TYPE_AWARE_PARSER_NAME)).toBeUndefined()
    expect(disabled(configs)).toContain('ts/no-floating-promises')
    expect(isTypeAware(buildOxlintConfig(configs)!)).toBe(true)
  })

  it('carries the options eslint resolved for them', async () => {
    const oxlint = buildOxlintConfig(await defineConfig({ strict: true }))

    expect(oxlint?.rules['typescript/return-await']).toEqual(['error', 'in-try-catch'])
    expect(oxlint?.rules['typescript/strict-boolean-expressions'])
      .toEqual(['error', { allowNullableBoolean: true, allowNullableObject: true }])
  })

  it('keeps the parser when a rule needing types stays in eslint', async () => {
    const off = await defineConfig({ strict: true, oxlint: false })
    const owned = await defineConfig({ strict: true, overrides: { rules: { 'ts/no-floating-promises': 'error' } } })

    expect(off.find(config => config.name === TYPE_AWARE_PARSER_NAME)).toBeDefined()
    expect(owned.find(config => config.name === TYPE_AWARE_PARSER_NAME)).toBeDefined()
  })

  it('asks for no type-aware pass when the config has no such rule', async () => {
    const oxlint = buildOxlintConfig(await defineConfig())

    expect(TYPE_AWARE.every(rule => LEDGER.includes(rule))).toBe(true)
    expect(isTypeAware(oxlint!)).toBe(false)
  })

  it('puts every type-checked rule our presets configure in the handover block', async () => {
    const configs = await defineConfig({ strict: true, svelte: true, a11y: true })

    expect(typeCheckedRulesConfigured(configs).every(rule => TYPE_AWARE.includes(rule))).toBe(true)
  })
})

describe('opting out', () => {
  it('keeps every rule in eslint when oxlint is off', async () => {
    const configs = await defineConfig({ oxlint: false, a11y: true })

    expect(handoffs(configs)).toBeEmpty()
    expect(buildOxlintConfig(configs)).toBeUndefined()
  })

  it('leaves a rule the consumer configured in eslint', async () => {
    const configs = await defineConfig({ overrides: { rules: { 'prefer-const': 'off', 'no-eval': 'error' } } })
    const oxlint = buildOxlintConfig(configs)

    for (const rule of ['prefer-const', 'no-eval']) {
      expect(handoff(configs)?.rules?.[rule]).toBeUndefined()
      expect(oxlint?.rules[rule]).toBeUndefined()
    }

    expect(oxlint?.rules['no-alert']).toBe('error')
  })

  it('leaves a rule a trailing user config touched in eslint', async () => {
    const configs = await defineConfig({}, { rules: { 'no-alert': 'warn' } })

    expect(handoff(configs)?.rules?.['no-alert']).toBeUndefined()
    expect(buildOxlintConfig(configs)?.rules['no-alert']).toBeUndefined()
  })
})

describe('generated config', () => {
  it('is accepted by oxlint', async () => {
    const oxlint = buildOxlintConfig(await defineConfig({ strict: true, a11y: true }))
    const dir = mkdtempSync(join(tmpdir(), 'kaynooo-oxlint-'))
    const configPath = join(dir, 'oxlintrc.json')
    const bin = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin/oxlint')

    writeFileSync(configPath, JSON.stringify(oxlint))
    writeFileSync(join(dir, 'probe.ts'), 'export const value: string[] = []\n')
    writeFileSync(join(dir, 'probe.tsx'), 'export const Probe = () => <img alt="probe" src="probe.png" />\n')

    const result = spawnSync(bin, ['--config', configPath, dir], { encoding: 'utf8' })

    expect(result.stderr + result.stdout).not.toContain('Failed to parse')
    expect(result.status).toBe(0)
  })

  it('reports the a11y rules on jsx and nowhere else', async () => {
    const oxlint = buildOxlintConfig(await defineConfig({ strict: true, a11y: true }))
    const dir = mkdtempSync(join(tmpdir(), 'kaynooo-oxlint-'))
    const configPath = join(dir, 'oxlintrc.json')
    const bin = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin/oxlint')
    const source = 'export const Probe = () => <img src="probe.png" />\n'

    writeFileSync(configPath, JSON.stringify(oxlint))
    writeFileSync(join(dir, 'scoped.tsx'), source)
    writeFileSync(join(dir, 'unscoped.js'), source)

    const output = spawnSync(bin, ['--config', configPath, dir], { encoding: 'utf8' }).stdout

    expect(output).toContain('scoped.tsx')
    expect(output).toContain('jsx-a11y(alt-text)')
    expect(output).not.toContain('unscoped.js')
  })

  it('leaves a file list it cannot read to eslint, as a commit touching only json hands it', async () => {
    const oxlint = buildOxlintConfig(await defineConfig())
    const dir = mkdtempSync(join(tmpdir(), 'kaynooo-oxlint-'))
    const configPath = join(dir, 'oxlintrc.json')
    const bin = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin/oxlint')
    const manifest = join(dir, 'package.json')

    writeFileSync(configPath, JSON.stringify(oxlint))
    writeFileSync(manifest, '{}\n')

    expect(spawnSync(bin, [...oxlintArgs(configPath, false), manifest], { encoding: 'utf8' }).status).toBe(0)
  })
})
