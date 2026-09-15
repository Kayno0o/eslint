import type { Rules, TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

const GLOB_SVELTE = ['**/*.svelte']
const GLOB_RUNES = ['**/*.svelte.ts', '**/*.svelte.js']

export async function svelte(): Promise<TypedFlatConfigItem[]> {
  const [parserSvelte, pluginSvelte, parserTs] = await Promise.all([
    import('svelte-eslint-parser'),
    interopDefault(import('eslint-plugin-svelte')),
    interopDefault(import('@typescript-eslint/parser')),
  ])
  // The plugin's recommended set, flattened: its base items scope their core rule fixes to components, which is where this preset applies them.
  const recommended: Rules = Object.fromEntries(pluginSvelte.configs.recommended.flatMap(config => Object.entries(config.rules ?? {})))
  const svelteRules: Rules = Object.fromEntries(Object.entries(recommended).filter(([rule]) => rule.startsWith('svelte/')))
  const languageOptions = {
    sourceType: 'module' as const,
    parser: parserSvelte,
    parserOptions: { extraFileExtensions: ['.svelte'], parser: parserTs },
  }

  return [
    {
      name: 'kaynooo/svelte/setup',
      plugins: { svelte: pluginSvelte },
    },
    {
      name: 'kaynooo/svelte/rules',
      files: GLOB_SVELTE,
      languageOptions,
      processor: 'svelte/svelte',
      rules: {
        ...recommended,
        'prefer-const': 'off',
        'svelte/prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: true }],
      },
    },
    {
      name: 'kaynooo/svelte/runes',
      files: GLOB_RUNES,
      languageOptions,
      rules: svelteRules,
    },
  ]
}
