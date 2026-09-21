import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

describe('jsonc preset', () => {
  it('collapses an object opened inline and closed on its own line in one fix, trailing spaces included', async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig(), fix: true })
    const [result] = await eslint.lintText('[\n  {"a": 1, \n"b": 2\n },\n  { "a": 3, "b": 4 }\n]\n', { filePath: 'probe.json' })

    expect(result?.messages).toEqual([])
    expect(result?.output).toBe('[\n  { "a": 1, "b": 2 },\n  { "a": 3, "b": 4 }\n]\n')
  })
})
