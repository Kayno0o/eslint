import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    typescript: './src/typescript.ts',
    astro: './src/astro.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  deps: {
    neverBundle: [
      '@antfu/eslint-config',
      'eslint',
      'eslint-flat-config-utils',
      'eslint-plugin-better-tailwindcss',
      'eslint-plugin-format',
      'eslint-plugin-github',
    ],
  },
})
