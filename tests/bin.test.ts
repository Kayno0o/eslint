import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'bun:test'

const root = join(import.meta.dir, '..')

describe('keslint', () => {
  it('keeps Node\'s compile cache beside the install, not in the temp directory', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'keslint-'))
    const env: Record<string, string | undefined> = { ...process.env, TMPDIR: tmp }

    delete env.NODE_COMPILE_CACHE

    try {
      const run = Bun.spawnSync(['bun', 'src/bin.ts', '--print-config', 'src/bin.ts'], { cwd: root, env, stdout: 'ignore' })

      expect(run.exitCode).toBe(0)
      expect(existsSync(join(tmp, 'node-compile-cache'))).toBe(false)
      expect(readdirSync(join(root, 'node_modules/.cache/node-compile-cache')).length).toBeGreaterThan(0)
    }
    finally {
      rmSync(tmp, { recursive: true, force: true })
    }
  })
})
