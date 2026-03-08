# Custom Builds

ts-charts is a monorepo of 30 independent packages. You can create custom builds that include only what you need.

## Selective Installation

Install only the packages you use:

```bash
# Just scales and shapes
bun add @ts-charts/scale @ts-charts/shape

# Just data processing
bun add @ts-charts/array @ts-charts/dsv

# Just geographic
bun add @ts-charts/geo
```

## Creating a Custom Bundle

Build a single file that includes only your dependencies:

```ts
// chart-utils.ts — your custom entry point
export { scaleLinear, scaleOrdinal, scaleBand } from '@ts-charts/scale'
export { line, area, arc } from '@ts-charts/shape'
export { axisBottom, axisLeft } from '@ts-charts/axis'
export { select } from '@ts-charts/selection'
export { format } from '@ts-charts/format'
```

Build it:

```ts
await Bun.build({
  entrypoints: ['chart-utils.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  minify: true,
})
```

This produces a single file with only the code paths you actually use.

## Package Dependencies

Understanding the dependency graph helps you make informed choices:

```
Tier 0 (no deps):     path, dispatch, polygon, timer, ease, dsv,
                       format, color, random, quadtree, hierarchy,
                       selection

Tier 1 (1-3 deps):    interpolate, chord, shape, fetch, time,
                       contour, geo, drag, force

Tier 2 (2-5 deps):    time-format, scale-chromatic, transition

Tier 3 (3+ deps):     scale, axis, brush, zoom
```

Packages only pull in their declared dependencies. Installing `@ts-charts/shape` brings in `@ts-charts/path` — nothing more.

## Replacing Individual Packages

Since each package has a stable public API, you can swap in your own implementation:

```ts
// package.json
{
  "dependencies": {
    "@ts-charts/scale": "workspace:*"  // use ts-charts
  },
  "overrides": {
    "@ts-charts/color": "./my-color-package"  // use your own
  }
}
```

## Build Without Types

If you don't need declaration files (e.g., for a final application build), skip the dtsx step:

```ts
// build.ts
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  minify: true,
  // no dtsx plugin — just emit JS
})
```

## Workspace Development

To work on ts-charts packages locally alongside your project:

```bash
# Clone the repo
git clone https://github.com/stacksjs/ts-charts
cd ts-charts
bun install

# Link a specific package
cd packages/scale
bun link

# In your project
bun link @ts-charts/scale
```

Changes to the linked package are immediately reflected in your project.
