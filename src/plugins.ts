import type { Linter } from 'eslint'
import type { Awaitable } from './types'
import globals from 'globals'

/** Resolve a dynamically imported module to its default export, tolerating CJS/ESM interop. */
export async function interopDefault<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m as { default?: unknown }

  return (resolved.default ?? resolved) as T extends { default: infer U } ? U : T
}

export const combinedGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.es2021,
}

/** A no-op parser used to hand formatting off to the formatter rules. */
export const parserPlain: Linter.Parser = {
  meta: { name: 'parser-plain' },
  parseForESLint: (code: string) => ({
    ast: {
      body: [],
      comments: [],
      loc: { end: code.length, start: 0 },
      range: [0, code.length],
      tokens: [],
      type: 'Program',
    },
    services: { isPlain: true },
    scopeManager: null,
    visitorKeys: { Program: [] },
  }),
}
