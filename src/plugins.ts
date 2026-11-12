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
