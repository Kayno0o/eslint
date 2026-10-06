import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

// Stands in for kay's own: hands the component through as TSX, and marks every block its parser reads.
const STUB = `export const processor = {
  supportsAutofix: true,
  preprocess: text => [{ text, filename: 'kay.tsx' }],
  postprocess: messages => messages.flat(),
}

export const parsed = []

export function shadowParser(parser) {
  return {
    meta: { name: 'stub' },
    parseForESLint(code, options) {
      parsed.push(options.filePath)

      return parser.parseForESLint(code, options)
    },
  }
}
`

const COMPONENT = `import { b } from './b'
let a = 1;
if (b) {
const c = a
}
`

const cwd = process.cwd()

/** A project depending on a stub `kay`, its component linted under the kay preset. */
async function lintComponent(): Promise<{ rules: string[], parsed: string[] }> {
  const dir = mkdtempSync(join(tmpdir(), 'kaynooo-kay-'))
  const kay = join(dir, 'node_modules', 'kay')

  mkdirSync(kay, { recursive: true })
  mkdirSync(join(dir, '.kay', 'types'), { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', type: 'module' }))
  writeFileSync(join(kay, 'package.json'), JSON.stringify({ name: 'kay', type: 'module', exports: { './eslint': './eslint.js' } }))
  writeFileSync(join(kay, 'eslint.js'), STUB)
  writeFileSync(join(dir, 'page.kay'), COMPONENT)
  writeFileSync(join(dir, '.kay', 'types', 'page.kay.tsx'), COMPONENT)

  // The preset finds `kay` from the project being linted, as keslint runs it.
  process.chdir(dir)

  const eslint = new ESLint({ cwd: dir, overrideConfigFile: true, overrideConfig: await defineConfig({ kay: true, tailwind: false }) })
  const results = await eslint.lintFiles(['.'])
  const stub = await import(join(kay, 'eslint.js')) as { parsed: string[] }

  return { rules: results.flatMap(result => result.messages.map(message => message.ruleId ?? 'fatal')), parsed: stub.parsed }
}

describe('kay preset', () => {
  afterEach(() => {
    process.chdir(cwd)
  })

  it('lints a component through the processor and parser of the app\'s kay', async () => {
    const { rules, parsed } = await lintComponent()

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toEndWith(join('page.kay', '0_kay.tsx'))
    expect(rules).toContain('prefer-const')
    expect(rules).toContain('style/semi')
  })

  it('leaves the generated shadow tree alone, and the rules the code around a fence trips', async () => {
    const { rules } = await lintComponent()

    expect(rules).not.toContain('style/indent')
    expect(rules).not.toContain('import/newline-after-import')
    // Only the component: the shadow tree beside it holds the same code.
    expect(rules.filter(rule => rule === 'prefer-const')).toHaveLength(1)
  })
})
