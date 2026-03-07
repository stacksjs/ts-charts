import { dts } from 'bun-plugin-dtsx'

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: true,
  minify: true,
  plugins: [dts()],
})
