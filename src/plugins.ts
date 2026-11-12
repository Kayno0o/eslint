import type { Awaitable } from './types'
import globals from 'globals'
import { version } from '../package.json'

// Stamped on the plugins this lib defines or alters, since ESLint's --cache keys results on each plugin's name and version and would keep the reports of the previous release.
export const libVersion: string = version

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
