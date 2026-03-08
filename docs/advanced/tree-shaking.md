# Tree Shaking

ts-charts is designed for optimal tree shaking. Every sub-package uses pure ESM with named exports, so bundlers can eliminate unused code.

## Import Strategies

### Umbrella Package

The simplest approach — import everything from `ts-charts`:

```ts
import { scaleLinear, line, select } from 'ts-charts'
```

This works well but may include more code than needed. Modern bundlers (Bun, Vite, Rollup, esbuild) will tree-shake unused exports.

### Individual Packages

For the smallest possible bundles, import from sub-packages directly:

```ts
import { scaleLinear } from '@ts-charts/scale'
import { line } from '@ts-charts/shape'
import { select } from '@ts-charts/selection'
```

This guarantees only the packages you use are included.

## Bundle Size

Each sub-package is independently publishable. Here are approximate source sizes for the most commonly used packages:

| Package | Source Lines | Description |
|---------|------------|-------------|
| `@ts-charts/scale` | ~1,200 | All scale types |
| `@ts-charts/shape` | ~2,500 | Line, area, arc, pie, stack |
| `@ts-charts/selection` | ~900 | DOM selection/manipulation |
| `@ts-charts/array` | ~1,400 | Statistics, binning, grouping |
| `@ts-charts/color` | ~600 | Color spaces |
| `@ts-charts/geo` | ~3,000 | Projections, path generation |
| `@ts-charts/interpolate` | ~600 | Value interpolation |
| `@ts-charts/format` | ~350 | Number formatting |

## Side-Effect Free

All packages are side-effect free except `@ts-charts/transition`, which augments the Selection prototype to add `.transition()`. If you don't use transitions, the transition code won't be included.

```ts
// This is side-effect free — no global state modified
import { scaleLinear } from '@ts-charts/scale'

// This has a side effect — extends Selection.prototype
import '@ts-charts/transition'
```

## Bun Build

For Bun projects, build with splitting and minification:

```ts
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  splitting: true,
  minify: true,
})
```
