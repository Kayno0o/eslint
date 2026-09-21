import type { Linter } from 'eslint'
import type { FactoryOptions } from '../src/types'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

/** A component with an un-awaited promise in its script, keyed by its format and the option turning it on. */
const COMPONENTS: [format: string, fileName: string, code: string, options: FactoryOptions][] = [
  ['svelte', 'Typed.svelte', '<script lang="ts">\nasync function load(): Promise<number> {\n  return 1\n}\n\nload()\n</script>\n\n<p>typed</p>\n', { svelte: true }],
  ['astro', 'Typed.astro', '---\nasync function load(): Promise<number> {\n  return 1\n}\n\nload()\n---\n<p>typed</p>\n', { astro: true }],
]

/** The severity ESLint resolves for `rule` on `filePath`, under a strict config built with `options`. */
async function severity(options: FactoryOptions, filePath: string, rule: string): Promise<Linter.RuleSeverity | undefined> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ strict: true, tailwind: false, ...options }) })
  const entry = (await eslint.calculateConfigForFile(filePath) as Linter.Config).rules?.[rule]

  return Array.isArray(entry) ? entry[0] : entry
}

/** Lints `fileName` in a fresh temp dir whose tsconfig covers it, under a strict config built with `options`. */
async function lintInProject(options: FactoryOptions, fileName: string, code: string): Promise<Linter.LintMessage[]> {
  const dir = mkdtempSync(join(tmpdir(), 'kaynooo-type-aware-'))

  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { strict: true, target: 'ESNext', module: 'ESNext', moduleResolution: 'bundler', verbatimModuleSyntax: true, noEmit: true, skipLibCheck: true },
    // The project service rejects a tsconfig with no TS-recognized input, so a real .ts file has to sit next to the component.
    include: ['**/*.ts', `**/${fileName}`],
  }))
  writeFileSync(join(dir, 'dummy.ts'), 'export const dummy = 1\n')
  writeFileSync(join(dir, fileName), code)

  const eslint = new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    overrideConfig: await defineConfig({ ...options, strict: true, tailwind: false, tsconfigPath: join(dir, 'tsconfig.json') }),
  })
  const [result] = await eslint.lintFiles([join(dir, fileName)])

  return result?.messages ?? []
}

describe('strict components', () => {
  for (const [format, fileName, code, options] of COMPONENTS) {
    it(`gives ${format} components the type-aware rules in place of the core rules they replace`, async () => {
      expect(await severity(options, `probe/${fileName}`, 'ts/no-floating-promises')).toBe(2)
      expect(await severity(options, `probe/${fileName}`, 'no-implied-eval')).toBe(0)
    })

    it(`type-checks ${format} components`, async () => {
      const messages = await lintInProject(options, fileName, code)

      expect(messages.filter(message => message.fatal === true)).toEqual([])
      expect(messages.map(message => message.ruleId)).toContain('ts/no-floating-promises')
    })
  }
})
