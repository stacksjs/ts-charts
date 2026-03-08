# What is ts-charts?

ts-charts is a complete TypeScript rewrite of all 30 D3.js packages. It provides the same powerful data visualization primitives you know from D3, but built from the ground up in TypeScript with modern tooling.

## Key Highlights

- **Fully Typed** — Every export has proper TypeScript types with `isolatedDeclarations` support. No more `@types/d3` needed.
- **Zero External Dependencies** — The entire library is self-contained. No transitive dependency tree to worry about.
- **Bun-First** — Developed and optimized for Bun, with full support for browser environments and other runtimes.
- **30 Packages** — Mirrors the modular D3 ecosystem: array, axis, brush, chord, color, contour, delaunay, dispatch, drag, dsv, ease, fetch, force, format, geo, hierarchy, interpolate, path, polygon, quadtree, random, scale, scale-chromatic, selection, shape, time, time-format, timer, transition, and zoom.
- **Umbrella Package** — Import everything from `ts-charts` or install individual `@ts-charts/*` packages for tree-shaking.
- **3500+ Tests** — Thorough test coverage ensuring compatibility with D3.js behavior.

## How It Works

ts-charts re-exports all 30 packages through a single umbrella module. You can use the full library or pick only the packages you need:

```ts
// use everything
import { scaleLinear, line, axisBottom } from 'ts-charts'

// or import individual packages
import { scaleLinear } from '@ts-charts/scale'
import { line } from '@ts-charts/shape'
import { axisBottom } from '@ts-charts/axis'
```

The API surface is intentionally compatible with D3.js, so migrating existing D3 code is straightforward — replace your imports and enjoy full type safety.
