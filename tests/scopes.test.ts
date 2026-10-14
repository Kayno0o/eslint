import type { Linter } from 'eslint'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

async function ruleEntry(filePath: string, rule: string, strict = false): Promise<Linter.RuleEntry | undefined> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig({ strict }) })

  return (await eslint.calculateConfigForFile(filePath) as Linter.Config).rules?.[rule]
}

function severity(entry: Linter.RuleEntry | undefined): Linter.RuleSeverity | undefined {
  return Array.isArray(entry) ? entry[0] : entry
}

describe('rule scopes', () => {
  it('runs the ts/* rules on TypeScript files only', async () => {
    expect(severity(await ruleEntry('src/probe.ts', 'ts/array-type'))).toBe(2)
    expect(severity(await ruleEntry('src/probe.js', 'ts/array-type'))).toBeUndefined()
  })

  it('lets a declaration file declare what nothing in it reads', async () => {
    expect(severity(await ruleEntry('src/probe.ts', 'unused-imports/no-unused-vars'))).toBe(2)
    expect(severity(await ruleEntry('src/probe.d.ts', 'unused-imports/no-unused-vars'))).toBe(0)
  })

  it('lets tests keep their regexes inline', async () => {
    expect(severity(await ruleEntry('src/probe.ts', 'e18e/prefer-static-regex'))).toBe(2)
    expect(severity(await ruleEntry('src/probe.test.ts', 'e18e/prefer-static-regex'))).toBe(0)
    expect(severity(await ruleEntry('tests-e2e/probe.e2e.ts', 'e18e/prefer-static-regex'))).toBe(0)
  })

  it('lets a test stub be async with nothing to await under strict', async () => {
    expect(severity(await ruleEntry('src/probe.ts', 'ts/require-await', true))).toBe(2)
    expect(severity(await ruleEntry('src/probe.test.ts', 'ts/require-await', true))).toBe(0)
  })

  it('keeps nullable booleans and objects allowed in conditions under strict', async () => {
    expect(await ruleEntry('src/probe.ts', 'ts/strict-boolean-expressions', true)).toEqual([2, { allowNullableBoolean: true, allowNullableObject: true }])
  })
})
