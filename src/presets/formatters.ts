import type { Linter } from 'eslint'
import type { OptionsFormatters, TypedFlatConfigItem } from '../types'
import { interopDefault, parserPlain } from '../plugins'

const GLOB_CSS = ['**/*.css', '**/*.{p,post}css']
const GLOB_SCSS = ['**/*.scss']
const GLOB_LESS = ['**/*.less']

const on = (v: unknown): boolean => v != null && v !== false

export function formattersEnabled(options: OptionsFormatters | boolean | undefined): boolean {
  if (options == null || options === false)
    return false

  if (options === true)
    return true

  return Object.values(options).some(Boolean)
}

export async function formatters(options: OptionsFormatters | boolean = {}): Promise<TypedFlatConfigItem[]> {
  const resolved: OptionsFormatters = options === true
    ? { css: true, html: true, markdown: true }
    : options === false
      ? {}
      : options

  const pluginFormat = await interopDefault(import('eslint-plugin-format'))

  const base = {
    endOfLine: 'auto',
    printWidth: 120,
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
    ...resolved.prettierOptions,
  }
  const prettier = (parser: string, extra: Record<string, unknown> = {}): Linter.RuleEntry =>
    ['error', { ...base, parser, plugins: [], ...extra }]

  const configs: TypedFlatConfigItem[] = [
    {
      name: 'kaynooo/formatter/setup',
      plugins: { format: pluginFormat },
    },
  ]

  const add = (name: string, files: string[], rule: Linter.RuleEntry) => {
    configs.push({
      name: `kaynooo/formatter/${name}`,
      files,
      languageOptions: { parser: parserPlain },
      rules: { 'format/prettier': rule },
    })
  }

  if (on(resolved.css)) {
    add('css', GLOB_CSS, prettier('css'))
    add('scss', GLOB_SCSS, prettier('scss'))
    add('less', GLOB_LESS, prettier('less'))
  }

  if (on(resolved.html))
    add('html', ['**/*.html'], prettier('html'))

  if (on(resolved.markdown))
    add('markdown', ['**/*.md'], prettier('markdown'))

  if (on(resolved.graphql))
    add('graphql', ['**/*.{g,graph}ql'], prettier('graphql'))

  if (on(resolved.xml))
    add('xml', ['**/*.xml'], prettier('xml', { plugins: ['@prettier/plugin-xml'] }))

  if (on(resolved.svg))
    add('svg', ['**/*.svg'], prettier('xml', { plugins: ['@prettier/plugin-xml'] }))

  return configs
}
