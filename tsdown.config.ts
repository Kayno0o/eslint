import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    typescript: './src/typescript.ts',
    astro: './src/astro.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  deps: {
    neverBundle: [
    // '@antfu/eslint-config',
    // 'eslint',
      'eslint-plugin-better-tailwindcss',
      // 'eslint-plugin-format',
      '@eslint/config-helpers',
    // 'eslint-flat-config-utils',
    ],
    onlyBundle: false,
  },
})
