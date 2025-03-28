import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['./index.ts'],
  format: ['esm'],
  minify: true,
  sourcemap: false,
  splitting: false,
  shims: true,
  dts: true,
})
