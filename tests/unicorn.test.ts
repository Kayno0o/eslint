import type { Rule } from 'eslint'
import type { Node } from 'estree'
import { describe, expect, it } from 'bun:test'
import { ESLint, Linter } from 'eslint'
import { defineConfig } from '../src/factory'
import { mergedWidth } from '../src/presets/unicorn'

async function ternaryReports(code: string): Promise<number[]> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig() })
  const [result] = await eslint.lintText(code, { filePath: 'src/probe.ts' })

  return result?.messages.filter(message => message.ruleId === 'unicorn/prefer-ternary').map(message => message.line) ?? []
}

describe('unicorn/prefer-ternary', () => {
  it('leaves an early return followed by the other return to kaynooo/prefer-ternary-return', async () => {
    const value = 'x'.repeat(100)

    expect(await ternaryReports(`export function f(a: boolean) {\n  if (a)\n    return '${value}'\n\n  return 'y'\n}\n`)).toEqual([])
    expect(await ternaryReports(`export function f(a: boolean) {\n  if (a) {\n    return '${value}'\n  }\n\n  return 'y'\n}\n`)).toEqual([])
  })

  it('stamps the plugins with the lib version, so --cache drops the reports of a previous release', async () => {
    const { unicorn } = await import('../src/presets/unicorn')
    const { kaynoooPlugin } = await import('../src/plugin')
    const { version } = await import('../package.json')
    const setup = (await unicorn()).find(item => item.name === 'kaynooo/unicorn/setup')

    expect(setup?.plugins?.unicorn?.meta?.version).toEndWith(`+kaynooo.${version}`)
    expect(kaynoooPlugin.meta.version).toBe(version)
  })

  it('estimates a fixless report from whole tokens, a string shared but for a few characters going whole into the ternary', () => {
    let width = 0
    const plugin = { rules: { width: { create: (context: Rule.RuleContext) => ({ IfStatement: (node: Node) => {
      width = mergedWidth(context.sourceCode, node)
    } }) } } }

    new Linter().verify('if (site.public === true) {\n  body.push(\'include /etc/nginx/snippets/ips-cloudflare.conf;\')\n}\nelse {\n  body.push(\'include /etc/nginx/snippets/real-ip-cloudflare.conf;\')\n}\n', { plugins: { probe: plugin }, rules: { 'probe/width': 'error' } })

    expect(width).toBe('body.push(site.public === true ? \'include /etc/nginx/snippets/ips-cloudflare.conf;\' : \'include /etc/nginx/snippets/real-ip-cloudflare.conf;\')'.length)
  })

  it('still reports an if/else of single-line branches', async () => {
    expect(await ternaryReports('export function f(a: boolean) {\n  if (a)\n    return 1\n  else\n    return 2\n}\n')).toEqual([2])
    expect(await ternaryReports('export function f(a: boolean, out: string[]) {\n  if (a)\n    out.push(\'yes\')\n  else\n    out.push(\'no\')\n}\n')).toEqual([2])
  })

  it('keeps an if/else whose ternary would pass 120 columns', async () => {
    expect(await ternaryReports(`export function f(a: boolean, out: string[]) {\n  if (a)\n    out.push('${'x'.repeat(60)}')\n  else\n    out.push('${'y'.repeat(60)}')\n}\n`)).toEqual([])
    // Objects of other shapes get no fix to dry-run, so the width is estimated from the branches.
    expect(await ternaryReports(`export function f(a: boolean, out: object[], file: File) {\n  if (a)\n    out.push({ kind: 'image', url: URL.createObjectURL(file), name: file.name, size: file.size })\n  else\n    out.push({ kind: 'file', name: file.name, size: file.size })\n}\n`)).toEqual([])

    expect(await ternaryReports(`export function f(a: boolean, out: object[], file: File) {\n  if (a)\n    out.push({ kind: 'image', size: file.size })\n  else\n    out.push({ kind: 'file' })\n}\n`)).toEqual([2])
  })
})
