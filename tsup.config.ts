import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['./src/index.ts'],
  format: ['esm'],
  minify: true,
  sourcemap: false,
  splitting: false,
  shims: false,
  dts: true,
})
