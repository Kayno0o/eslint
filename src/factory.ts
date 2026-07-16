import type { Linter } from 'eslint'
import type { Awaitable, FactoryOptions, TypedFlatConfigItem } from './types'
import { composer } from 'eslint-flat-config-utils'
import { astro } from './presets/astro'
import { command } from './presets/command'
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
import { markdown } from './presets/markdown'
import { node } from './presets/node'
import { perfectionist } from './presets/perfectionist'
import { regexp } from './presets/regexp'
import { solid } from './presets/solid'
import { stylistic } from './presets/stylistic'
import { test } from './presets/test'
import { toml } from './presets/toml'
import { typescript } from './presets/typescript'
import { unicorn } from './presets/unicorn'
import { yaml } from './presets/yaml'

type UserConfig = Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | Linter.Config[]>

export async function defineConfig(options: FactoryOptions = {}, ...userConfigs: UserConfig[]) {
  const {
    strict,
    tsconfigPath,
    filesTypeAware,
    formatters: formattersOptions,
    astro: enableAstro,
    solid: enableSolid,
    overrides,
  } = options

  const configs: Awaitable<TypedFlatConfigItem[]>[] = [
    ignores(),
    javascript(),
    comments(),
    command(),
    perfectionist(),
    node(),
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

  if (enableAstro === true)
    configs.push(astro())

  if (enableSolid != null && enableSolid !== false)
    configs.push(solid())

  configs.push(jsonc(), yaml(), toml(), markdown())

  if (formattersEnabled(formattersOptions))
    configs.push(formatters(formattersOptions))

  configs.push(disables())

  if (overrides != null)
    configs.push([{ name: 'kaynooo/overrides', ...overrides }])

  return composer<TypedFlatConfigItem>(...configs, ...userConfigs)
}
