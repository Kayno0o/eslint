import type { Linter } from 'eslint'
import markdown from '@eslint/markdown'
import { mergeProcessors, processorPassThrough } from 'eslint-merge-processors'
import globals from 'globals'
import * as parserToml from 'toml-eslint-parser'
import * as parserYaml from 'yaml-eslint-parser'

export { parserToml, parserYaml }
export { default as pluginE18e } from '@e18e/eslint-plugin'

export { default as pluginComments } from '@eslint-community/eslint-plugin-eslint-comments'
export { default as pluginMarkdown } from '@eslint/markdown'
export { default as pluginStylistic } from '@stylistic/eslint-plugin'
export { default as pluginTs } from '@typescript-eslint/eslint-plugin'
export { default as parserTs } from '@typescript-eslint/parser'
export { default as pluginAntfu } from 'eslint-plugin-antfu'
export { default as pluginCommand } from 'eslint-plugin-command'
export { default as pluginFormat } from 'eslint-plugin-format'
export { default as pluginImport } from 'eslint-plugin-import-lite'
export { default as pluginJsdoc } from 'eslint-plugin-jsdoc'
export { default as pluginJsonc } from 'eslint-plugin-jsonc'
export { default as pluginTest } from 'eslint-plugin-no-only-tests'
export { default as pluginPerfectionist } from 'eslint-plugin-perfectionist'
export { default as pluginRegexp } from 'eslint-plugin-regexp'
export { default as pluginToml } from 'eslint-plugin-toml'
export { default as pluginUnicorn } from 'eslint-plugin-unicorn'
export { default as pluginUnusedImports } from 'eslint-plugin-unused-imports'
export { default as pluginYaml } from 'eslint-plugin-yml'

export const combinedGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.es2021,
}

/** A no-op parser used to hand formatting off to the formatter rules. */
export const parserPlain: Linter.Parser = {
  meta: { name: 'parser-plain' },
  parseForESLint: (code: string) => ({
    ast: {
      body: [],
      comments: [],
      loc: { end: code.length, start: 0 },
      range: [0, code.length],
      tokens: [],
      type: 'Program',
    },
    services: { isPlain: true },
    scopeManager: null,
    visitorKeys: { Program: [] },
  }),
}

export const markdownProcessor = mergeProcessors([
  markdown.processors.markdown,
  processorPassThrough,
])
