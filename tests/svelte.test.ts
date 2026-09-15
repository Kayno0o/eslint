import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'
import { buildOxlintConfig, oxlintArgs } from '../src/oxlint/config'

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

const TYPE_ONLY_MODULE = `import { Mode } from './mode'

export const mode: Mode | undefined = undefined
`

/** The rules ESLint reports on `code`, linted as `filePath` under the Svelte preset built with `options`. */
async function reported(options: { oxlint?: boolean }, filePath: string, code: string): Promise<string[]> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ svelte: true, tailwind: false, ...options }) })
  const [result] = await eslint.lintText(code, { filePath })

  return result?.messages.map(message => message.ruleId ?? 'fatal') ?? []
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
})

describe('svelte handover', () => {
  it('keeps on eslint, in a component, a rule oxlint skips there', async () => {
    expect(await reported({}, 'probe/Probe.svelte', COMPONENT)).toContain('ts/consistent-type-imports')
    expect(await reported({}, 'probe/probe.ts', TYPE_ONLY_MODULE)).not.toContain('ts/consistent-type-imports')
  })

  it('still hands the rules a component keeps over for every other file', async () => {
    const oxlint = buildOxlintConfig(await defineConfig({ svelte: true }))

    expect(oxlint?.rules['no-self-assign']).toBeDefined()
    expect(oxlint?.rules['prefer-const']).toBeDefined()
    expect(oxlint?.overrides).toContainEqual({ files: ['**/*.svelte'], rules: { 'no-self-assign': 'off', 'prefer-const': 'off', 'typescript/consistent-type-imports': 'off' } })
  })

  it('leaves a self-assignment in a component to the svelte plugin, and reports it anywhere else', async () => {
    const oxlint = buildOxlintConfig(await defineConfig({ svelte: true }))
    const dir = mkdtempSync(join(tmpdir(), 'kaynooo-oxlint-'))
    const configPath = join(dir, 'oxlintrc.json')
    const bin = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin/oxlint')
    const script = 'let items = [1]\n\nfunction add(): void {\n  items = items\n}\n\nadd()\n'

    writeFileSync(configPath, JSON.stringify(oxlint))
    writeFileSync(join(dir, 'Component.svelte'), `<script lang="ts">\n${script}</script>\n`)
    writeFileSync(join(dir, 'module.ts'), script)

    const output = spawnSync(bin, [...oxlintArgs(configPath, false), dir], { encoding: 'utf8' }).stdout

    expect(output).toContain('module.ts')
    expect(output).not.toContain('Component.svelte')
  })
})
