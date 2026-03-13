import { dts } from 'bun-plugin-dtsx'

// eslint-disable-next-line pickier/no-unused-vars
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  // eslint-disable-next-line pickier/no-unused-vars
  splitting: true,
  minify: true,
  plugins: [dts()],
})
