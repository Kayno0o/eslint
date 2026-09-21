#!/usr/bin/env bun
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import process from 'node:process'

// Resolved from this package rather than the app, so an app depending only on @kaynooo/eslint gets the eslint its config was built against.
const pkgPath = createRequire(import.meta.url).resolve('eslint/package.json')
const { bin } = JSON.parse(readFileSync(pkgPath, 'utf8')) as { bin: Record<string, string> }

process.exit(spawnSync(join(dirname(pkgPath), bin.eslint), process.argv.slice(2), { stdio: 'inherit' }).status ?? 1)
