import type { Linter } from 'eslint'
import type { FactoryOptions } from '../src/types'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

/** Each component format `oxlint-tsgolint` never reads, with a file of that format and the option turning it on. */
const COMPONENTS: [format: string, filePath: string, options: FactoryOptions][] = [
  ['astro', 'probe/Probe.astro', { astro: true }],
  ['svelte', 'probe/Probe.svelte', { svelte: true }],
]

/** The severity ESLint resolves for `rule` on `filePath`, under a strict config built with `options`. */
async function severity(options: FactoryOptions, filePath: string, rule: string): Promise<Linter.RuleSeverity | undefined> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ strict: true, tailwind: false, ...options }) })
  const entry = (await eslint.calculateConfigForFile(filePath) as Linter.Config).rules?.[rule]

  return Array.isArray(entry) ? entry[0] : entry
}

describe('strict components', () => {
  for (const [format, filePath, options] of COMPONENTS) {
    it(`keeps the core rules on ${format} components while their type-aware versions go to oxlint, which never reads them`, async () => {
      expect(await severity(options, filePath, 'dot-notation')).toBe(2)
      expect(await severity(options, filePath, 'no-implied-eval')).toBe(2)
    })

    it(`type-checks ${format} components once eslint keeps the type-aware rules`, async () => {
      expect(await severity({ ...options, oxlint: false }, filePath, 'ts/no-floating-promises')).toBe(2)
      expect(await severity({ ...options, oxlint: false }, filePath, 'no-implied-eval')).toBe(0)
    })
  }
})
