import type { Linter } from 'eslint'

export type Awaitable<T> = T | Promise<T>

export type TypedFlatConfigItem = Omit<Linter.Config, 'plugins'> & {
  name?: string
  plugins?: Record<string, any>
}

export type Rules = Partial<Linter.RulesRecord>

export interface OptionsFormatters {
  /** Enable formatting support for CSS, Less, Sass, and SCSS. */
  css?: 'prettier' | boolean
  /** Enable formatting support for HTML. */
  html?: 'prettier' | boolean
  /** Enable formatting support for XML. */
  xml?: 'prettier' | boolean
  /** Enable formatting support for SVG. */
  svg?: 'prettier' | boolean
  /** Enable formatting support for Markdown. */
  markdown?: 'prettier' | 'dprint' | boolean
  /** Enable formatting support for GraphQL. */
  graphql?: 'prettier' | boolean
  /** Enable formatting support for Astro. */
  astro?: 'prettier' | boolean
  /** Custom options for Prettier. */
  prettierOptions?: Record<string, any>
  /** Custom options for dprint. */
  dprintOptions?: boolean
  /** Enable formatting support for Slidev. */
  slidev?: boolean | { files?: string[] }
}

export interface SolidOptions {
  overrides?: Rules
}

export interface FactoryOptions {
  /** Enable type-aware linting (requires a tsconfig). */
  strict?: boolean
  /** Path to the tsconfig used for type-aware linting. */
  tsconfigPath?: string
  /** Files to lint with type information. */
  filesTypeAware?: string[]
  /** Enable formatters (CSS, HTML, ...). */
  formatters?: OptionsFormatters | boolean
  /** Enable the Astro preset. */
  astro?: boolean
  /** Enable the Solid preset. */
  solid?: SolidOptions | boolean
  /** Flat-config fields merged into the trailing overrides item. */
  overrides?: Omit<TypedFlatConfigItem, 'files'>
}

/** Kept for API compatibility with the previous antfu-based signature. */
export type OptionsConfig = FactoryOptions
