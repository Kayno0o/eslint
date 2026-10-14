import type { Linter } from 'eslint'
import { describe, expect, it } from 'bun:test'
import { ESLint } from 'eslint'
import { defineConfig } from '../src/factory'

async function tailwindSettings(options: Parameters<typeof defineConfig>[0]): Promise<unknown> {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: await defineConfig(options) })
  const config = await eslint.calculateConfigForFile('src/probe.ts') as Linter.Config

  return config.settings?.['better-tailwindcss']
}

describe('tailwind preset', () => {
  it('stays off unless asked for', async () => {
    expect(await tailwindSettings({})).toBeUndefined()
  })

  it('reads kay\'s src/app.css by default', async () => {
    expect(await tailwindSettings({ tailwind: true })).toEqual({ entryPoint: 'src/app.css' })
  })

  it('takes another entry point', async () => {
    expect(await tailwindSettings({ tailwind: { entryPoint: 'styles/main.css' } })).toEqual({ entryPoint: 'styles/main.css' })
  })
})
