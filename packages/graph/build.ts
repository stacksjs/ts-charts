import { dts } from 'bun-plugin-dtsx'

// `layered` is its own entry point, not just a re-export: it is pure geometry
// with no DOM dependencies, so importing it must not drag selection/drag/zoom
// into a bundle. Splitting is off so each entry stays self-contained.
// eslint-disable-next-line pickier/no-unused-vars, ts/no-top-level-await
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: true,
  minify: true,
  plugins: [dts()],
})

// eslint-disable-next-line pickier/no-unused-vars, ts/no-top-level-await
await Bun.build({
  entrypoints: ['src/layered.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: false,
  minify: true,
  plugins: [dts()],
})
