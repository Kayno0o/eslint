import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'
import { buildOxlintConfig, oxlintArgs } from '../src/oxlint/config'
import { LEDGER, PARTIALS } from '../src/oxlint/ledger'
import { svelte } from '../src/presets/svelte'

const OXLINT_BIN = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin/oxlint')

const COMPONENT = `<script lang="ts">
  import { Mode } from './mode'

  let count = $state(0)
  let { label }: { label: string } = $props()
  let fixed = 1
  const mode: Mode | undefined = undefined
</script>

<button onclick={() => count++}>{label} {fixed} {mode}</button>
{@html label}
`

const LEGACY_COMPONENT = `<script>
  let count = 0
  let doubled = 0

  $: doubled = count * 2
</script>

<button onclick={() => count++}>{doubled}</button>
`

const TYPE_ONLY_MODULE = `import { Mode } from './mode'

export const mode: Mode | undefined = undefined
`

const RUNES_MODULE = `let count = $state(0)

$inspect(count)

export function increment() {
  count++
}
`

const LABELED_MODULE = `outer: for (const item of [1, 2]) {
  if (item > 1)
    break outer
}
`

/** The rules ESLint reports on `code`, linted as `filePath` under the Svelte preset built with `options`. */
async function reported(options: { oxlint?: boolean }, filePath: string, code: string): Promise<string[]> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ svelte: true, tailwind: false, ...options }) })
  const [result] = await eslint.lintText(code, { filePath })

  return result?.messages.map(message => message.ruleId ?? 'fatal') ?? []
}

/** What oxlint prints, one problem per line, on `files` written to a fresh directory, under the config the Svelte preset hands over. */
async function oxlintReports(files: Record<string, string>): Promise<string[]> {
  const dir = mkdtempSync(join(tmpdir(), 'kaynooo-oxlint-'))
  const configPath = join(dir, 'oxlintrc.json')

  writeFileSync(configPath, JSON.stringify(buildOxlintConfig(await defineConfig({ svelte: true }))))

  for (const [name, code] of Object.entries(files))
    writeFileSync(join(dir, name), code)

  return spawnSync(OXLINT_BIN, [...oxlintArgs(configPath, false), '-f', 'unix', dir], { encoding: 'utf8' }).stdout.split('\n')
}

describe('svelte preset', () => {
  it('lints a component through its markup', async () => {
    const rules = await reported({ oxlint: false }, 'probe/Probe.svelte', COMPONENT)

    expect(rules).toContain('svelte/no-at-html-tags')
    expect(rules).toContain('ts/consistent-type-imports')
    // Only `fixed`: destructured props and the state the markup reassigns stay `let`.
    expect(rules.filter(rule => rule === 'svelte/prefer-const')).toHaveLength(1)
    expect(rules).not.toContain('prefer-const')
  })

  it('runs the svelte rules on rune modules', async () => {
    expect(await reported({ oxlint: false }, 'probe/counter.svelte.ts', RUNES_MODULE)).toContain('svelte/no-inspect')
    expect(await reported({ oxlint: false }, 'probe/counter.svelte.js', RUNES_MODULE)).toContain('svelte/no-inspect')
  })
})

describe('svelte handover', () => {
  it('keeps on eslint, in a component, a rule oxlint skips there', async () => {
    expect(await reported({}, 'probe/Probe.svelte', COMPONENT)).toContain('ts/consistent-type-imports')
    expect(await reported({}, 'probe/probe.ts', TYPE_ONLY_MODULE)).not.toContain('ts/consistent-type-imports')
  })

  it('still hands the rules a component keeps over for every other file', async () => {
    const oxlint = buildOxlintConfig(await defineConfig({ svelte: true }))

    expect(oxlint?.rules['no-labels']).toBeDefined()
    expect(oxlint?.rules['no-self-assign']).toBeDefined()
    expect(oxlint?.rules['prefer-const']).toBeDefined()
    expect(oxlint?.overrides).toContainEqual({ files: ['**/*.svelte'], rules: { 'no-labels': 'off', 'no-self-assign': 'off', 'prefer-const': 'off', 'typescript/consistent-type-imports': 'off' } })
  })

  it('lists in the partial every ledger rule the component preset sets, since the handover never reads that preset', async () => {
    const component = (await svelte()).find(config => config.name === 'kaynooo/svelte/rules')
    const ledger = new Set(LEDGER)
    const kept = new Set(PARTIALS.find(partial => partial.preset === component?.name)?.rules)
    const set = Object.keys(component?.rules ?? {}).filter(rule => ledger.has(rule))

    expect(set.length).toBeGreaterThan(0)
    expect(set.filter(rule => !kept.has(rule))).toEqual([])
  })

  it('leaves a self-assignment in a component to the svelte plugin, and reports it anywhere else', async () => {
    const script = 'let items = [1]\n\nfunction add(): void {\n  items = items\n}\n\nadd()\n'
    const lines = await oxlintReports({ 'Component.svelte': `<script lang="ts">\n${script}</script>\n`, 'module.ts': script })

    expect(lines.some(line => line.includes('module.ts'))).toBe(true)
    expect(lines.filter(line => line.includes('Component.svelte'))).toEqual([])
  })

  it('leaves a legacy `$:` statement in a component to the svelte parser, and reports a label anywhere else', async () => {
    const labels = (await oxlintReports({ 'Legacy.svelte': LEGACY_COMPONENT, 'labeled.ts': LABELED_MODULE })).filter(line => line.includes('(no-labels)'))

    expect(labels.some(line => line.includes('labeled.ts'))).toBe(true)
    expect(labels.filter(line => line.includes('Legacy.svelte'))).toEqual([])
  })
})
