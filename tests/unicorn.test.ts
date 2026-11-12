import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

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

  it('stamps the plugin with a version of its own, so --cache drops the reports it filters', async () => {
    const { unicorn } = await import('../src/presets/unicorn')
    const setup = (await unicorn()).find(item => item.name === 'kaynooo/unicorn/setup')

    expect(setup?.plugins?.unicorn?.meta?.version).toEndWith('+kaynooo-ternary')
  })

  it('still reports an if/else of single-line branches', async () => {
    expect(await ternaryReports('export function f(a: boolean) {\n  if (a)\n    return 1\n  else\n    return 2\n}\n')).toEqual([2])
  })
})
