import type { Awaitable, FactoryOptions, TypedFlatConfigItem, UserConfig } from './types'
import process from 'node:process'
import { composer } from 'eslint-flat-config-utils'
import { detectExtensions } from './detect'
import { a11y, a11yAstro } from './presets/a11y'
import { astro } from './presets/astro'
import { comments } from './presets/comments'
import { disables } from './presets/disables'
import { e18e } from './presets/e18e'
import { formatters, formattersEnabled } from './presets/formatters'
import { ignores } from './presets/ignores'
import { imports } from './presets/imports'
import { javascript } from './presets/javascript'
import { jsdoc } from './presets/jsdoc'
import { jsonc } from './presets/jsonc'
import { jsx } from './presets/jsx'
import { kaynooo, kaynoooTypeAware } from './presets/kaynooo'
import { markdown } from './presets/markdown'
import { perfectionist } from './presets/perfectionist'
import { regexp } from './presets/regexp'
import { solid } from './presets/solid'
import { stylistic } from './presets/stylistic'
import { tailwind } from './presets/tailwind'
import { test } from './presets/test'
import { toml } from './presets/toml'
import { typescript } from './presets/typescript'
import { ui } from './presets/ui'
import { unicorn } from './presets/unicorn'
import { yaml } from './presets/yaml'

const GLOB_TS = ['**/*.?([cm])ts', '**/*.?([cm])tsx']

export async function defineConfig(options: FactoryOptions = {}, ...userConfigs: UserConfig[]) {
  const {
    strict = false,
    tsconfigPath = strict ? 'tsconfig.json' : undefined,
    astro: enableAstro = false,
    solid: enableSolid = false,
    a11y: enableA11y = false,
    overrides,
  } = options

  const markup = enableAstro || enableSolid
  const filesTypeAware = options.filesTypeAware ?? (enableAstro ? [...GLOB_TS, '**/*.astro'] : GLOB_TS)
  const formattersOptions = options.formatters ?? (markup ? { css: true } : undefined)
  const tailwindOptions = options.tailwind ?? markup

  const configs: Awaitable<TypedFlatConfigItem[]>[] = [
    ignores(),
    javascript(),
    comments(),
    perfectionist(),
    jsdoc(),
    imports(),
    e18e(),
    unicorn(),
    jsx(),
    typescript({ strict, tsconfigPath, filesTypeAware }),
    stylistic(),
    regexp(),
    test(),
  ]

  if (enableAstro)
    configs.push(astro())

  if (enableSolid)
    configs.push(solid())

  if (enableA11y) {
    configs.push(a11y())

    if (enableAstro)
      configs.push(a11yAstro())
  }

  const present = detectExtensions(process.cwd(), ['.json', '.json5', '.jsonc', '.yaml', '.yml', '.toml', '.md'])

  if (present.has('.json') || present.has('.json5') || present.has('.jsonc'))
    configs.push(jsonc())

  if (present.has('.yaml') || present.has('.yml'))
    configs.push(yaml())

  if (present.has('.toml'))
    configs.push(toml())

  if (present.has('.md'))
    configs.push(markdown())

  if (formattersEnabled(formattersOptions))
    configs.push(formatters(formattersOptions))

  configs.push(disables(), kaynooo())

  if (markup)
    configs.push(ui())

  if (tailwindOptions !== false)
    configs.push(tailwind(tailwindOptions === true ? {} : tailwindOptions))

  if (strict)
    configs.push(kaynoooTypeAware(filesTypeAware))

  if (overrides != null)
    configs.push([{ name: 'kaynooo/overrides', ...overrides }])

  return composer<TypedFlatConfigItem>(...configs, ...userConfigs)
}
