import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'output',
  '.output',
  '.cache',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.vercel',
  'temp',
  '.temp',
  'tmp',
  '.tmp',
  '.yarn',
  '.history',
])

/** Walk `root` (skipping ignored dirs) and return which of `wanted` file extensions exist. Short-circuits once all are found. */
export function detectExtensions(root: string, wanted: readonly string[]): Set<string> {
  const want = new Set(wanted)
  const found = new Set<string>()

  const walk = (dir: string): void => {
    if (found.size === want.size)
      return

    let entries

    try {
      entries = readdirSync(dir, { withFileTypes: true })
    }
    catch {
      return
    }

    for (const entry of entries) {
      if (found.size === want.size)
        return

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name))
          walk(join(dir, entry.name))
      }
      else {
        const dot = entry.name.lastIndexOf('.')

        if (dot > 0) {
          const ext = entry.name.slice(dot)

          if (want.has(ext))
            found.add(ext)
        }
      }
    }
  }

  walk(root)

  return found
}
