import type { Linter } from 'eslint'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

async function eslintFor(options: Parameters<typeof defineConfig>[0]): Promise<ESLint> {
  return new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ tailwind: false, ...options }) })
}

describe('javascript files', () => {
  for (const fileName of ['probe.js', 'probe.mjs', 'probe.cjs', 'probe.jsx']) {
    it(`parses ${fileName} with the scope manager typescript-eslint's unused-vars rule expects`, async () => {
      const eslint = await eslintFor({ strict: true })
      const config = await eslint.calculateConfigForFile(`src/${fileName}`) as Linter.Config

      expect((config.languageOptions?.parser as Linter.Parser | undefined)?.meta?.name).toBe('typescript-eslint/parser')
    })
  }

  it('does not report a variable that is read as only used as a type', async () => {
    const eslint = await eslintFor({ strict: true })
    const [result] = await eslint.lintText('const a = 1\n\nconsole.log(a)\n', { filePath: 'src/probe.js' })

    expect(result?.messages.map(message => message.ruleId)).not.toContain('unused-imports/no-unused-vars')
  })

  it('still reports a variable that is never read', async () => {
    const eslint = await eslintFor({})
    const [result] = await eslint.lintText('const a = 1\n', { filePath: 'src/probe.js' })

    expect(result?.messages.map(message => message.ruleId)).toContain('unused-imports/no-unused-vars')
  })

  it('does not report a using or await using binding that is never read', async () => {
    const eslint = await eslintFor({})
    const [result] = await eslint.lintText('declare function hold(): Disposable & AsyncDisposable\n\nexport async function probe(): Promise<void> {\n  using held = hold()\n  await using later = hold()\n}\n', { filePath: 'src/probe.ts' })

    expect(result?.messages.map(message => message.ruleId)).not.toContain('unused-imports/no-unused-vars')
  })
})
