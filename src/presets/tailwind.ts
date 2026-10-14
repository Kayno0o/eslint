import type { TailwindOptions, TypedFlatConfigItem } from '../types'
import { interopDefault } from '../plugins'

export async function tailwind(options: TailwindOptions = {}): Promise<TypedFlatConfigItem[]> {
  const { multiline = false, entryPoint = 'src/app.css' } = options
  const pluginTailwind = await interopDefault(import('eslint-plugin-better-tailwindcss'))

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
