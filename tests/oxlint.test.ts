import type { TypedFlatConfigItem } from '../src/types'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import { defineConfig } from '../src/factory'
import { buildOxlintConfig, OXLINT_CONFIG_NAME } from '../src/oxlint/config'
import { LEDGER } from '../src/oxlint/ledger'

const handoff = (configs: TypedFlatConfigItem[]) => configs.find(config => config.name === OXLINT_CONFIG_NAME)

describe('ledger handoff', () => {
  it('turns the handed-over rules off in eslint and on in oxlint', async () => {
    const configs = await defineConfig({ strict: true })
    const disabled = Object.keys(handoff(configs)?.rules ?? {})
    const oxlint = buildOxlintConfig(configs)

    expect(disabled.length).toBeGreaterThan(0)
    expect(Object.values(handoff(configs)?.rules ?? {})).toEqual(disabled.map(() => 'off'))
    expect(Object.keys(oxlint?.rules ?? {})).toHaveLength(disabled.length)
    expect(disabled.every(rule => LEDGER.includes(rule))).toBe(true)
  })

  it('keeps markdown code blocks on eslint', async () => {
    const configs = await defineConfig()

    expect(handoff(configs)?.ignores).toEqual(['**/*.md/**'])
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

describe('opting out', () => {
  it('keeps every rule in eslint when oxlint is off', async () => {
    const configs = await defineConfig({ oxlint: false })

    expect(handoff(configs)).toBeUndefined()
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
    const oxlint = buildOxlintConfig(await defineConfig({ strict: true }))
    const dir = mkdtempSync(join(tmpdir(), 'kaynooo-oxlint-'))
    const configPath = join(dir, 'oxlintrc.json')
    const bin = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin/oxlint')

    writeFileSync(configPath, JSON.stringify(oxlint))
    writeFileSync(join(dir, 'probe.ts'), 'export const value: string[] = []\n')

    const result = spawnSync(bin, ['--config', configPath, dir], { encoding: 'utf8' })

    expect(result.stderr + result.stdout).not.toContain('Failed to parse')
    expect(result.status).toBe(0)
  })
})
