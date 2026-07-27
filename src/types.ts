import type { Linter } from 'eslint'

export type Awaitable<T> = T | Promise<T>

export type TypedFlatConfigItem = Omit<Linter.Config, 'plugins'> & {
  name?: string
  plugins?: Record<string, any>
}

export type Rules = Partial<Linter.RulesRecord>

export type UserConfig = Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | Linter.Config[]>

export type StatementType = '*' | 'exports' | 'require' | 'directive' | 'iife' | 'block' | 'empty' | 'function' | 'ts-method' | 'break' | 'case' | 'class' | 'continue' | 'debugger' | 'default' | 'do' | 'for' | 'if' | 'import' | 'switch' | 'throw' | 'try' | 'while' | 'with' | 'cjs-export' | 'cjs-import' | 'enum' | 'interface' | 'function-overload' | 'block-like' | 'singleline-block-like' | 'multiline-block-like' | 'expression' | 'singleline-expression' | 'multiline-expression' | 'return' | 'singleline-return' | 'multiline-return' | 'export' | 'singleline-export' | 'multiline-export' | 'var' | 'singleline-var' | 'multiline-var' | 'let' | 'singleline-let' | 'multiline-let' | 'const' | 'singleline-const' | 'multiline-const' | 'using' | 'singleline-using' | 'multiline-using' | 'type' | 'singleline-type' | 'multiline-type'

export type StatementGroup = [StatementType, ...StatementType[]]

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

export interface TailwindOptions {
  /** Wrap classes onto their own lines instead of collapsing to a single line. */
  multiline?: boolean
  /** CSS file declaring the Tailwind entry point. */
  entryPoint?: string
}

export interface FactoryOptions {
  /** Enable type-aware linting. Requires `tsconfigPath` to resolve. */
  strict?: boolean
  /** Path to the tsconfig used for type-aware linting. */
  tsconfigPath?: string
  /** Files to lint with type information. Defaults to every TS file, plus `.astro` when `astro` is on. */
  filesTypeAware?: string[]
  /** Enable formatters (CSS, HTML, ...). Defaults to `{ css: true }` when `astro` or `solid` is on. */
  formatters?: OptionsFormatters | boolean
  /** Enable the Astro preset. */
  astro?: boolean
  /** Enable the Solid preset. */
  solid?: boolean
  /** Enable the accessibility preset (`jsx-a11y`) on JSX files, plus `.astro` when `astro` is on. */
  a11y?: boolean
  /** Enable the Tailwind preset. Defaults to on when `astro` or `solid` is on. */
  tailwind?: TailwindOptions | boolean
  /** Flat-config fields merged into the trailing overrides item. */
  overrides?: Omit<TypedFlatConfigItem, 'files'>
}
