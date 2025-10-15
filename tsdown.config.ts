import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    typescript: './src/typescript.ts',
    astro: './src/astro.ts',
    vue: './src/vue.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
})
