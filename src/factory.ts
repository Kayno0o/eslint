import type { Awaitable, FactoryOptions, TypedFlatConfigItem, UserConfig } from './types'
import process from 'node:process'
import { composer } from 'eslint-flat-config-utils'
import { detectExtensions } from './detect'
import { comments } from './presets/comments'
import { disables } from './presets/disables'
import { e18e } from './presets/e18e'
import { formatters, formattersEnabled } from './presets/formatters'
import { ignores } from './presets/ignores'
import { imports } from './presets/imports'
import { javascript } from './presets/javascript'
import { jsonc } from './presets/jsonc'
import { kay } from './presets/kay'
import { kaynooo } from './presets/kaynooo'
import { markdown } from './presets/markdown'
import { perfectionist } from './presets/perfectionist'
import { regexp } from './presets/regexp'
import { stylistic } from './presets/stylistic'
import { tailwind } from './presets/tailwind'
import { test } from './presets/test'
import { toml } from './presets/toml'
import { typescript } from './presets/typescript'
import { unicorn } from './presets/unicorn'
import { yaml } from './presets/yaml'

const GLOB_TS = ['**/*.?([cm])ts', '**/*.?([cm])tsx']

export async function defineConfig(options: FactoryOptions = {}, ...userConfigs: UserConfig[]) {
  const {
    strict = false,
    tsconfigPath = strict ? 'tsconfig.json' : undefined,
    filesTypeAware = GLOB_TS,
    kay: enableKay = false,
    tailwind: tailwindOptions = false,
    formatters: formattersOptions,
    overrides,
  } = options

  const configs: Awaitable<TypedFlatConfigItem[]>[] = [
    ignores(),
    javascript(),
    comments(),
    perfectionist(),
    imports(),
    e18e(),
    unicorn(),
    typescript({ strict, tsconfigPath, filesTypeAware }),
    stylistic(),
    regexp(),
    test(),
  ]

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

  // After the stylistic and import rules, which it turns off where the code kay generates around a fence would trip them.
  if (enableKay)
    configs.push(kay())

  if (tailwindOptions !== false)
    configs.push(tailwind(tailwindOptions === true ? {} : tailwindOptions))

  if (overrides != null)
    configs.push([{ name: 'kaynooo/overrides', ...overrides }])

  return composer<TypedFlatConfigItem>(...configs, ...userConfigs)
}
