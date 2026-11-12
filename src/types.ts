import type { ESLint, Linter } from 'eslint'

export type Awaitable<T> = T | Promise<T>

export type TypedFlatConfigItem = Omit<Linter.Config, 'plugins'> & {
  name?: string
  plugins?: Record<string, ESLint.Plugin>
}

export type Rules = Partial<Linter.RulesRecord>

export type UserConfig = Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[] | Linter.Config[]>

export interface TailwindOptions {
  /** Wrap classes onto their own lines instead of collapsing to a single line. */
  multiline?: boolean
  /** CSS file declaring the Tailwind entry point, kay's `src/app.css` by default. */
  entryPoint?: string
}

export interface FactoryOptions {
  /** Enable type-aware linting. Requires `tsconfigPath` to resolve. */
  strict?: boolean
  /** Path to the tsconfig used for type-aware linting. */
  tsconfigPath?: string
  /** Files to lint with type information. Defaults to every TS file. */
  filesTypeAware?: string[]
  /** Lint the script and server fences of kay's `.kay` components, type-aware under `strict` once `kay check` has written their shadow types. */
  kay?: boolean
  /** Enable the Tailwind preset. */
  tailwind?: TailwindOptions | boolean
  /** Flat-config fields merged into the trailing overrides item. */
  overrides?: Omit<TypedFlatConfigItem, 'files'>
}
