import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

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

const RUNES_MODULE = `let count = $state(0)

$inspect(count)

export function increment() {
  count++
}
`

/** The rules ESLint reports on `code`, linted as `filePath` under the Svelte preset. */
async function reported(filePath: string, code: string): Promise<string[]> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ svelte: true, tailwind: false }) })
  const [result] = await eslint.lintText(code, { filePath })

  return result?.messages.map(message => message.ruleId ?? 'fatal') ?? []
}

describe('svelte preset', () => {
  it('lints a component through its markup', async () => {
    const rules = await reported('probe/Probe.svelte', COMPONENT)

    expect(rules).toContain('svelte/no-at-html-tags')
    expect(rules).toContain('ts/consistent-type-imports')
    // Only `fixed`: destructured props and the state the markup reassigns stay `let`.
    expect(rules.filter(rule => rule === 'svelte/prefer-const')).toHaveLength(1)
    expect(rules).not.toContain('prefer-const')
  })

  it('runs the svelte rules on rune modules', async () => {
    expect(await reported('probe/counter.svelte.ts', RUNES_MODULE)).toContain('svelte/no-inspect')
    expect(await reported('probe/counter.svelte.js', RUNES_MODULE)).toContain('svelte/no-inspect')
  })
})
