import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

// Each rule with code it must report, then code it must let through.
const CASES: [rule: string, bad: string, good: string][] = [
  ['ts/no-explicit-any', 'export const a: any = 1\n', 'export const a: unknown = 1\n'],
  ['e18e/prefer-static-regex', 'export function digits(text: string) {\n  return /\\d+/.test(text)\n}\n', 'const DIGITS = /\\d+/\n\nexport function digits(text: string) {\n  return DIGITS.test(text)\n}\n'],
  ['unicorn/prefer-set-has', 'const KINDS = [\'a\', \'b\']\n\nexport function known(kind: string) {\n  return KINDS.includes(kind)\n}\n', 'const KINDS = new Set([\'a\', \'b\'])\n\nexport function known(kind: string) {\n  return KINDS.has(kind)\n}\n'],
  ['unicorn/prefer-ternary', 'export function label(admin: boolean) {\n  let role\n\n  if (admin)\n    role = \'admin\'\n  else\n    role = \'user\'\n\n  return role\n}\n', 'export function label(admin: boolean) {\n  const role = admin ? \'admin\' : \'user\'\n\n  return role\n}\n'],
  ['kaynooo/prefer-ternary-return', 'export function label(admin: boolean) {\n  if (admin)\n    return \'admin\'\n\n  return \'user\'\n}\n', 'export function label(admin: boolean) {\n  return admin ? \'admin\' : \'user\'\n}\n'],
  ['no-nested-ternary', 'export function sign(n: number) {\n  return n > 0 ? 1 : n < 0 ? -1 : 0\n}\n', 'export function sign(n: number) {\n  return n > 0 ? 1 : 0\n}\n'],
  ['style/multiline-comment-style', '/**\n * Two lines\n * of doc.\n */\nexport const a = 1\n', '// Two lines\n// of doc.\nexport const a = 1\n'],
]

const dir = mkdtempSync(join(tmpdir(), 'kaynooo-style-rules-'))

writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { strict: true, target: 'ESNext', module: 'ESNext', moduleResolution: 'bundler', noEmit: true, skipLibCheck: true },
  include: ['*.ts'],
}))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

// Lints `code` as a file of a temp project whose tsconfig covers it, under a strict config.
async function rulesReported(code: string): Promise<(string | null)[]> {
  const file = join(dir, 'probe.ts')

  writeFileSync(file, code)

  const eslint = new ESLint({ cwd: dir, overrideConfigFile: true, overrideConfig: await defineConfig({ strict: true, tsconfigPath: join(dir, 'tsconfig.json') }) })
  const [result] = await eslint.lintFiles([file])

  return result?.messages.map(message => message.ruleId) ?? []
}

describe('style rules', () => {
  for (const [rule, bad, good] of CASES) {
    it(`${rule} reports the shape it forbids`, async () => {
      expect(await rulesReported(bad)).toContain(rule)
    })

    it(`${rule} lets the preferred shape through`, async () => {
      expect(await rulesReported(good)).not.toContain(rule)
    })
  }

  it('fixes a two-way return written with else into a ternary, not into an early return', async () => {
    const eslint = new ESLint({ fix: true, overrideConfigFile: true, overrideConfig: await defineConfig({}) })
    const [result] = await eslint.lintText('export function label(admin: boolean) {\n  if (admin)\n    return \'admin\'\n  else\n    return \'user\'\n}\n', { filePath: 'src/probe.ts' })

    expect(result?.output).toBe('export function label(admin: boolean) {\n  return admin ? \'admin\' : \'user\'\n}\n')
  })

  it('ts/require-await reports an async function that neither awaits nor returns a promise', async () => {
    expect(await rulesReported('export async function one() {\n  return 1\n}\n')).toContain('ts/require-await')
  })

  it('ts/require-await keeps async on a function returning a promise without awaiting', async () => {
    expect(await rulesReported('export async function later() {\n  return Promise.resolve(1)\n}\n')).not.toContain('ts/require-await')
  })
})
