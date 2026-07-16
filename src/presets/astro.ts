import type { TypedFlatConfigItem } from '../types'
import * as parserAstro from 'astro-eslint-parser'
import pluginAstro from 'eslint-plugin-astro'
import { parserTs } from '../plugins'

export function astro(): TypedFlatConfigItem[] {
  return [
    {
      name: 'antfu/astro/setup',
      plugins: { astro: pluginAstro },
    },
    {
      name: 'antfu/astro/rules',
      files: ['**/*.astro'],
      languageOptions: {
        sourceType: 'module',
        parser: parserAstro,
        parserOptions: { extraFileExtensions: ['.astro'], parser: parserTs },
        globals: { ...pluginAstro.environments.astro.globals },
      },
      processor: 'astro/client-side-ts',
      rules: {
        'antfu/no-top-level-await': 'off',
        'astro/missing-client-only-directive-value': 'error',
        'astro/no-conflict-set-directives': 'error',
        'astro/no-deprecated-astro-canonicalurl': 'error',
        'astro/no-deprecated-astro-fetchcontent': 'error',
        'astro/no-deprecated-astro-resolve': 'error',
        'astro/no-deprecated-getentrybyslug': 'error',
        'astro/no-set-html-directive': 'off',
        'astro/no-unused-define-vars-in-style': 'error',
        'astro/semi': 'off',
        'astro/valid-compile': 'error',
        'style/indent': 'off',
        'style/jsx-closing-tag-location': 'off',
        'style/jsx-one-expression-per-line': 'off',
        'style/no-multiple-empty-lines': 'off',
      },
    },
  ]
}
