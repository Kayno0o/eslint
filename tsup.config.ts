import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['./index.ts', './typescript.ts', './astro.ts', './vue.ts'],
  format: ['esm'],
  minify: true,
  sourcemap: false,
  splitting: false,
  shims: true,
  dts: true,
  bundle: false,
})
