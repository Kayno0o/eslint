import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

// Stands in for kay's own: hands the component through as TSX, and marks every block its parser reads.
const STUB = `export const processor = {
  meta: { name: 'kay', version: '__VERSION__' },
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
export function digits(text: string) {
  return /\\d+/.test(text)
}
`

const cwd = process.cwd()
const dirs: string[] = []

/** A project depending on a stub `kay`, its component linted under the kay preset. */
async function lintComponent(version = '1.70.0'): Promise<{ rules: string[], parsed: string[] }> {
  const dir = mkdtempSync(join(tmpdir(), 'kaynooo-kay-'))
  const kay = join(dir, 'node_modules', 'kay')

  dirs.push(dir)

  mkdirSync(kay, { recursive: true })
  mkdirSync(join(dir, '.kay', 'types'), { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', type: 'module' }))
  writeFileSync(join(kay, 'package.json'), JSON.stringify({ name: 'kay', type: 'module', exports: { './eslint': './eslint.js' } }))
  writeFileSync(join(kay, 'eslint.js'), STUB.replace('__VERSION__', version))
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

    for (const dir of dirs.splice(0))
      rmSync(dir, { recursive: true, force: true })
  })

  it('lints a component through the processor and parser of the app\'s kay', async () => {
    const { rules, parsed } = await lintComponent()

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toEndWith(join('page.kay', '0_kay.tsx'))
    expect(rules).toContain('prefer-const')
    expect(rules).toContain('style/semi')
  })

  it('names what is missing when the app has no kay to lint with', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'kaynooo-kay-'))

    dirs.push(dir)
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', type: 'module' }))
    process.chdir(dir)

    let refusal: unknown

    try {
      await defineConfig({ kay: true, tailwind: false })
    }
    catch (error) {
      refusal = error
    }

    expect(String(refusal)).toContain('depend on kay 0.14 or later under the name kay')
  })

  it('leaves the generated shadow tree alone, and the rules the code around a fence trips', async () => {
    const { rules } = await lintComponent()

    expect(rules).not.toContain('import/newline-after-import')
    // Only the component: the shadow tree beside it holds the same code.
    expect(rules.filter(rule => rule === 'prefer-const')).toHaveLength(1)
  })

  it('lints the indentation of a fence under a kay that reads it, and leaves it off under an older one', async () => {
    expect((await lintComponent('1.70.0')).rules).toContain('style/indent')
    expect((await lintComponent('1.69.3')).rules).not.toContain('style/indent')
  })

  it('lets a component keep its regexes inline, having no module scope to move them to', async () => {
    const { rules } = await lintComponent()

    expect(rules).not.toContain('e18e/prefer-static-regex')
  })

  it('applies the config items kay asks for its tests, and runs on a kay without any', async () => {
    // One project per stub: the preset imports the stub by path, which the module cache keeps.
    async function ruleOf(stub: string): Promise<unknown> {
      const dir = mkdtempSync(join(tmpdir(), 'kaynooo-kay-'))
      const kay = join(dir, 'node_modules', 'kay')

      dirs.push(dir)
      mkdirSync(kay, { recursive: true })
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', type: 'module' }))
      writeFileSync(join(kay, 'package.json'), JSON.stringify({ name: 'kay', type: 'module', exports: { './eslint': './eslint.js' } }))
      writeFileSync(join(kay, 'eslint.js'), `${STUB.replace('__VERSION__', '1.70.0')}${stub}`)
      process.chdir(dir)

      const eslint = new ESLint({ cwd: dir, overrideConfigFile: true, overrideConfig: await defineConfig({ kay: true, tailwind: false, strict: true }) })
      const config = await eslint.calculateConfigForFile(join(dir, 'tests', 'a.test.ts')) as { rules: Record<string, unknown> }

      return config.rules['ts/await-thenable']
    }

    expect(await ruleOf('')).toEqual([2])
    expect(await ruleOf(`export const testRules = [{ files: ['**/*.test.ts'], rules: { 'ts/await-thenable': 'off' } }]`)).toEqual([0])
  })
})
