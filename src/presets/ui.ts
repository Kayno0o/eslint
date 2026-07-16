import type { TypedFlatConfigItem } from '../types'

/** Markup-oriented style tweaks shared by the Astro and Solid setups. */
export function ui(): TypedFlatConfigItem[] {
  return [
    {
      name: 'kaynooo/ui/rules',
      ignores: ['**/*.md'],
      rules: {
        'style/indent': ['error', 2],
        'style/jsx-self-closing-comp': ['error', { component: true, html: true }],
        'style/jsx-tag-spacing': 'off',
      },
    },
  ]
}
