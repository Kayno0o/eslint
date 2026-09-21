import type { Mock } from 'bun:test'
import type { Linter } from 'eslint'
import type { FactoryOptions } from '../src/types'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

const ASTRO_CODE = '---\nasync function load(): Promise<number> {\n  return 1\n}\n\nload()\n---\n<p>typed</p>\n'

/** Lints an `.astro` fixture in a fresh temp dir, under a strict config built with `options`. */
async function lintAstro(options: FactoryOptions): Promise<Linter.LintMessage[]> {
  const dir = mkdtempSync(join(tmpdir(), 'kaynooo-astro-type-aware-'))

  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { strict: true, target: 'ESNext', module: 'ESNext', moduleResolution: 'bundler', verbatimModuleSyntax: true, noEmit: true, skipLibCheck: true },
    include: ['**/*.ts', '**/*.astro'],
  }))
  writeFileSync(join(dir, 'dummy.ts'), 'export const dummy = 1\n')
  writeFileSync(join(dir, 'Typed.astro'), ASTRO_CODE)

  const eslint = new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    overrideConfig: await defineConfig({ ...options, strict: true, tailwind: false, tsconfigPath: join(dir, 'tsconfig.json') }),
  })
  const [result] = await eslint.lintFiles([join(dir, 'Typed.astro')])

  return result?.messages ?? []
}

describe('astro type-aware parsing', () => {
  let warnSpy: Mock<typeof console.warn>

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn')
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('type-checks an astro file without the projectService warning', async () => {
    const messages = await lintAstro({ astro: true })

    expect(messages.map(message => message.ruleId)).toContain('ts/no-floating-promises')
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
