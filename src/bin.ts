#!/usr/bin/env bun
import type { Awaitable, TypedFlatConfigItem } from './types'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { buildOxlintConfig } from './oxlint/config'

const CONFIG_FILES = ['eslint.config.ts', 'eslint.config.mts', 'eslint.config.cts', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs']

/** Forwarded to oxlint as well as ESLint. Everything else is ESLint's. */
const SHARED_FLAGS = new Set(['--fix', '--quiet', '--max-warnings'])

/** ESLint flags whose value is a separate argument, so it is not mistaken for a path. */
const VALUE_FLAGS = new Set([
  '-c',
  '--config',
  '-f',
  '--format',
  '-o',
  '--output-file',
  '--ext',
  '--rule',
  '--rulesdir',
  '--plugin',
  '--parser',
  '--parser-options',
  '--global',
  '--env',
  '--ignore-pattern',
  '--resolve-plugins-relative-to',
  '--max-warnings',
  '--cache-location',
  '--cache-strategy',
  '--report-unused-disable-directives-severity',
  '--flag',
  '--concurrency',
])

function splitArgs(argv: string[]): { oxlint: string[], eslint: string[] } {
  const oxlint: string[] = []
  const eslint: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    eslint.push(arg)

    if (!arg.startsWith('-')) {
      oxlint.push(arg)

      continue
    }

    const equals = arg.indexOf('=')
    const shared = SHARED_FLAGS.has(equals < 0 ? arg : arg.slice(0, equals))

    if (shared)
      oxlint.push(arg)

    if (VALUE_FLAGS.has(arg) && i + 1 < argv.length) {
      const value = argv[++i]

      eslint.push(value)

      if (shared)
        oxlint.push(value)
    }
  }

  return { oxlint, eslint }
}

function resolveBin(specifier: string, from: string): string | undefined {
  try {
    const pkgPath = createRequire(from).resolve(`${specifier}/package.json`)
    const { bin } = JSON.parse(readFileSync(pkgPath, 'utf8')) as { bin: string | Record<string, string> }
    const entry = typeof bin === 'string' ? bin : bin[specifier]

    return entry == null ? undefined : join(dirname(pkgPath), entry)
  }
  catch {
    return undefined
  }
}

function cacheDir(cwd: string): string {
  const local = join(cwd, 'node_modules', '.cache', 'kaynooo')

  try {
    mkdirSync(local, { recursive: true })

    return local
  }
  catch {
    const fallback = join(tmpdir(), 'kaynooo-eslint')

    mkdirSync(fallback, { recursive: true })

    return fallback
  }
}

/**
 * Generate the oxlint config matching the project's ESLint config, cached against the config file's contents and
 * this build - loading a flat config costs about a second, and nothing else can change what it produces.
 */
async function oxlintConfigPath(cwd: string, configFile: string): Promise<string | undefined> {
  const dir = cacheDir(cwd)
  const configPath = join(dir, 'oxlintrc.json')
  const keyPath = join(dir, 'oxlintrc.key')
  const build = statSync(join(import.meta.dirname, 'index.js')).mtimeMs
  const key = createHash('sha256').update(`${build}\0${configFile}\0`).update(readFileSync(configFile)).digest('hex')

  if (existsSync(keyPath) && readFileSync(keyPath, 'utf8') === key)
    return existsSync(configPath) ? configPath : undefined

  const module = await import(pathToFileURL(configFile).href) as { default: Awaitable<TypedFlatConfigItem[]> }
  const oxlintConfig = buildOxlintConfig(await module.default)

  writeFileSync(configPath, oxlintConfig == null ? '' : JSON.stringify(oxlintConfig, null, 2))
  writeFileSync(keyPath, key)

  return oxlintConfig == null ? undefined : configPath
}

const cwd = process.cwd()
const args = splitArgs(process.argv.slice(2))
const configFile = CONFIG_FILES.map(name => join(cwd, name)).find(path => existsSync(path))

let status = 0

if (configFile != null) {
  const oxlintBin = resolveBin('oxlint', import.meta.url)
  const configPath = oxlintBin == null ? undefined : await oxlintConfigPath(cwd, configFile)

  if (oxlintBin != null && configPath != null)
    status = spawnSync(oxlintBin, ['--config', configPath, ...args.oxlint], { stdio: 'inherit' }).status ?? 1
}

const eslintBin = resolveBin('eslint', join(cwd, 'package.json')) ?? 'eslint'

process.exit(Math.max(status, spawnSync(eslintBin, args.eslint, { stdio: 'inherit' }).status ?? 1))
