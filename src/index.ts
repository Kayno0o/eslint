export { defineConfig as default, defineConfig } from './factory'
export type { OxlintConfig, OxlintOverride } from './oxlint/config'
export { buildOxlintConfig } from './oxlint/config'
export { LEDGER, TYPE_AWARE } from './oxlint/ledger'
export { kaynoooPlugin } from './plugin'
export type {
  Awaitable,
  FactoryOptions,
  OptionsFormatters,
  Rules,
  TailwindOptions,
  TypedFlatConfigItem,
  UserConfig,
} from './types'
