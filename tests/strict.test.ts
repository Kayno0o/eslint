import type { Linter } from 'eslint'
import type { FactoryOptions } from '../src/types'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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

/** A component with an un-awaited promise in its script, keyed by the glob and options a consumer would use to target it. */
const CONSUMER_TYPE_AWARE: [format: string, glob: string, fileName: string, code: string, options: FactoryOptions][] = [
  ['svelte', '**/*.svelte', 'Typed.svelte', '<script lang="ts">\nasync function load(): Promise<number> {\n  return 1\n}\n\nload()\n</script>\n\n<p>typed</p>\n', { svelte: true }],
  ['astro', '**/*.astro', 'Typed.astro', '---\nasync function load(): Promise<number> {\n  return 1\n}\n\nload()\n---\n<p>typed</p>\n', { astro: true }],
]

/** Lints `fileName` in a fresh temp dir, under a strict handover config whose tsconfig `include` is `tsconfigInclude` and whose consumer configs are `userConfigs`. */
async function lintInProject(options: FactoryOptions, tsconfigInclude: string[], fileName: string, code: string, ...userConfigs: Linter.Config[]): Promise<Linter.LintMessage[]> {
  const dir = mkdtempSync(join(tmpdir(), 'kaynooo-type-aware-'))

  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { strict: true, target: 'ESNext', module: 'ESNext', moduleResolution: 'bundler', verbatimModuleSyntax: true, noEmit: true, skipLibCheck: true },
    // The project service rejects a tsconfig with no TS-recognized input, so a real .ts file has to sit next to the component.
    include: tsconfigInclude,
  }))
  writeFileSync(join(dir, 'dummy.ts'), 'export const dummy = 1\n')
  writeFileSync(join(dir, fileName), code)

  const eslint = new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    overrideConfig: await defineConfig({ ...options, strict: true, tailwind: false, tsconfigPath: join(dir, 'tsconfig.json') }, ...userConfigs),
  })
  const [result] = await eslint.lintFiles([join(dir, fileName)])

  return result?.messages ?? []
}

describe('strict handover with a consumer-owned type-aware rule on a component', () => {
  for (const [format, glob, fileName, code, options] of CONSUMER_TYPE_AWARE) {
    it(`gives a ${format} component type information instead of throwing when a consumer configures a type-aware rule on it themselves`, async () => {
      const messages = await lintInProject(options, ['**/*.ts', glob], fileName, code, { files: [glob], rules: { 'ts/no-floating-promises': 'error' } })

      expect(messages.map(message => message.ruleId)).toContain('ts/no-floating-promises')
    })
  }
})

describe('strict handover with a consumer type-aware rule scoped to TS files only', () => {
  for (const [format, , fileName, code, options] of CONSUMER_TYPE_AWARE) {
    it(`leaves an untouched ${format} component alone, even when the tsconfig does not cover it`, async () => {
      const messages = await lintInProject(options, ['**/*.ts'], fileName, code, { files: ['**/*.ts'], rules: { 'ts/no-floating-promises': 'error' } })

      expect(messages.filter(message => message.fatal === true)).toEqual([])
    })
  }
})

describe('strict handover with a consumer type-aware rule that has no files', () => {
  for (const [format, glob, fileName, code, options] of CONSUMER_TYPE_AWARE) {
    it(`reaches every ${format} component without throwing`, async () => {
      const messages = await lintInProject(options, ['**/*.ts', glob], fileName, code, { rules: { 'ts/no-floating-promises': 'error' } })

      expect(messages.map(message => message.ruleId)).toContain('ts/no-floating-promises')
    })
  }
})

describe('strict handover with a consumer type-aware rule that ignores a component', () => {
  for (const [format, glob, fileName, code, options] of CONSUMER_TYPE_AWARE) {
    it(`leaves the ignored ${format} component alone, even when the tsconfig does not cover it`, async () => {
      const messages = await lintInProject(options, ['**/*.ts'], fileName, code, { rules: { 'ts/no-floating-promises': 'error' }, ignores: [glob] })

      expect(messages.filter(message => message.fatal === true)).toEqual([])
    })
  }
})
