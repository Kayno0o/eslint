import type { TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function astro(): Promise<TypedFlatConfigItem[]> {
  const [parserAstro, pluginAstro, parserTs] = await Promise.all([
    import('astro-eslint-parser'),
    interopDefault(import('eslint-plugin-astro')),
    interopDefault(import('@typescript-eslint/parser')),
  ])

  return [
    {
      name: 'kaynooo/astro/setup',
      plugins: { astro: pluginAstro },
    },
    {
      name: 'kaynooo/astro/rules',
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
