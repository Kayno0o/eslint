import pkg from '../package.json'

const entrypoints = [
  'src/typescript.ts',
  'src/astro.ts',
  'src/solid.ts',
]

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]

const result = await Bun.build({
  entrypoints,
  outdir: 'dist',
  root: 'src',
  target: 'node',
  format: 'esm',
  splitting: true,
  minify: true,
  external,
})

if (!result.success) {
  for (const log of result.logs)
    console.error(log)
  process.exit(1)
}
