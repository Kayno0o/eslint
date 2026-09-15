import type { Awaitable, FactoryOptions, TypedFlatConfigItem, UserConfig } from './types'
import process from 'node:process'
import { composer } from 'eslint-flat-config-utils'
import { detectExtensions } from './detect'
import { componentTypeAwareParsers, needsTypeInformation, oxlintDisables, TYPE_AWARE_PARSER_NAME } from './oxlint/config'
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
import { svelte } from './presets/svelte'
import { tailwind } from './presets/tailwind'
import { test } from './presets/test'
import { toml } from './presets/toml'
import { typescript } from './presets/typescript'
import { ui } from './presets/ui'
import { unicorn } from './presets/unicorn'
import { yaml } from './presets/yaml'

const GLOB_TS = ['**/*.?([cm])ts', '**/*.?([cm])tsx']

/** A `filesTypeAware` glob naming a component format, captured to tell which one. */
const COMPONENT_TYPE_AWARE_GLOB = /\.(astro|svelte)$/

export async function defineConfig(options: FactoryOptions = {}, ...userConfigs: UserConfig[]) {
  const {
    strict = false,
    tsconfigPath = strict ? 'tsconfig.json' : undefined,
    astro: enableAstro = false,
    solid: enableSolid = false,
    svelte: enableSvelte = false,
    a11y: enableA11y = false,
    oxlint: enableOxlint = true,
    overrides,
  } = options

  const markup = enableAstro || enableSolid || enableSvelte
  const componentGlobs = [...(enableAstro ? ['**/*.astro'] : []), ...(enableSvelte ? ['**/*.svelte'] : [])]
  // oxlint-tsgolint reads neither component format, so under the handover giving components our own type-aware rules would only turn off the core rules those replace. A consumer's own type-aware rule reaching a component still gets the parser, scoped by componentTypeAwareParsers below.
  const filesTypeAware = options.filesTypeAware ?? [...GLOB_TS, ...(enableOxlint ? [] : componentGlobs)]
  // Under the handover, a component named explicitly in filesTypeAware keeps the type-aware block in eslint, since tsgolint never reads it.
  const typeAwareComponents = enableOxlint
    ? filesTypeAware.filter((glob) => {
      const ext = COMPONENT_TYPE_AWARE_GLOB.exec(glob)?.[1]

      return (ext === 'astro' && enableAstro) || (ext === 'svelte' && enableSvelte)
    })
    : []
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
    typescript({ strict, tsconfigPath, filesTypeAware, componentExts: enableSvelte ? ['svelte'] : [] }),
    stylistic(),
    regexp(),
    test(),
  ]

  if (enableAstro)
    configs.push(astro())

  if (enableSolid)
    configs.push(solid())

  if (enableSvelte)
    configs.push(svelte())

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

  const resolved = (await Promise.all(configs.map(async config => config))).flat()
  const user = (await Promise.all(userConfigs.map(async config => config))).flat() as TypedFlatConfigItem[]
  // Under the handover, a consumer's own live type-aware rule still needs the parser's projectService wherever it reaches a component. Spliced right after the parser item, and so before astro's or svelte's own item, so their extraFileExtensions and inner parser still win the merge for it.
  const typeAwareParserIndex = resolved.findIndex(config => config.name === TYPE_AWARE_PARSER_NAME)
  const componentParsers = enableOxlint ? componentTypeAwareParsers([...resolved, ...user], resolved[typeAwareParserIndex], componentGlobs) : []

  if (typeAwareParserIndex !== -1)
    resolved.splice(typeAwareParserIndex + 1, 0, ...componentParsers)

  const oxlint = enableOxlint ? oxlintDisables([...resolved, ...user], typeAwareComponents) : []
  const final = [...resolved, ...user, ...oxlint]

  return composer<TypedFlatConfigItem>(
    ...(needsTypeInformation(final) ? final : final.filter(config => config.name !== TYPE_AWARE_PARSER_NAME && !config.name?.startsWith(`${TYPE_AWARE_PARSER_NAME}/`))),
  )
}
