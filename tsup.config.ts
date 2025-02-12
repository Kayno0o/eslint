import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['./index.js'],
  format: ['cjs', 'esm'],
  minify: true,
  sourcemap: false,
  splitting: false,
})
