import type { TailwindOptions, TypedFlatConfigItem } from '../types'
import pluginTailwind from 'eslint-plugin-better-tailwindcss'

export function tailwind(options: TailwindOptions = {}): TypedFlatConfigItem[] {
  const { multiline = false, entryPoint = 'src/styles/global.css' } = options

  return [
    {
      name: 'kaynooo/tailwind/rules',
      plugins: { 'better-tailwindcss': pluginTailwind },
      settings: { 'better-tailwindcss': { entryPoint } },
      rules: {
        ...pluginTailwind.configs['recommended-warn'].rules,
        'better-tailwindcss/enforce-consistent-important-position': ['warn', { position: 'recommended' }],
        'better-tailwindcss/enforce-consistent-line-wrapping': multiline
          ? ['warn', { group: 'newLine', printWidth: 120 }]
          : ['warn', { printWidth: 0, preferSingleLine: true }],
        'better-tailwindcss/enforce-consistent-variable-syntax': ['warn'],
        'better-tailwindcss/enforce-shorthand-classes': ['warn'],
        'better-tailwindcss/no-unknown-classes': ['warn', { detectComponentClasses: true }],
      },
    },
  ]
}
