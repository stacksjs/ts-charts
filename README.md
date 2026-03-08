<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# ts-charts

> A complete TypeScript rewrite of D3.js — fully typed, zero dependencies, Bun-first.

All 30 D3.js packages, rewritten from the ground up in TypeScript with `isolatedDeclarations` support. Ships as a single umbrella package or 30+ individually installable sub-packages.

## Features

- 🔷 **Fully Typed** — strict TypeScript with `isolatedDeclarations: true`, no `any` leaks
- 📦 **Zero Dependencies** — no external runtime dependencies, everything inlined
- ⚡ **Bun-First** — optimized for Bun, works in all modern browsers
- 🌳 **Tree-Shakeable** — ESM-only, import only what you need
- 🧪 **3,500+ Tests** — comprehensive test suite ported from D3, all passing
- 🎯 **D3 API Compatible** — drop-in replacement for D3.js

## Install

```bash
# install the umbrella package (everything)
bun add ts-charts

# or install individual packages
bun add @ts-charts/scale
bun add @ts-charts/selection
bun add @ts-charts/shape
```

## Usage

```ts
// import everything
import { scaleLinear, line, select } from 'ts-charts'

// or import from individual packages
import { scaleLinear } from '@ts-charts/scale'
import { line } from '@ts-charts/shape'
import { select } from '@ts-charts/selection'

// create a linear scale
const x = scaleLinear()
  .domain([0, 100])
  .range([0, 960])

// create a line generator
const myLine = line()
  .x((d: [number, number]) => x(d[0]))
  .y((d: [number, number]) => d[1])
```

## Packages

| Package | Description |
|---------|-------------|
| `@ts-charts/array` | Array manipulation, statistics, histograms, bisection |
| `@ts-charts/axis` | SVG axis generators for scales |
| `@ts-charts/brush` | 1D and 2D brush selections |
| `@ts-charts/chord` | Chord diagram layout and ribbon generator |
| `@ts-charts/color` | Color spaces: RGB, HSL, Lab, HCL, Cubehelix |
| `@ts-charts/contour` | Contour polygons and density estimation |
| `@ts-charts/delaunay` | Delaunay triangulation and Voronoi diagrams |
| `@ts-charts/dispatch` | Named event dispatching |
| `@ts-charts/drag` | Drag-and-drop interaction |
| `@ts-charts/dsv` | CSV and TSV parsing and formatting |
| `@ts-charts/ease` | Easing functions for transitions |
| `@ts-charts/fetch` | Convenience wrappers for the Fetch API |
| `@ts-charts/force` | Force-directed graph layout |
| `@ts-charts/format` | Number formatting (SI, fixed, currency, etc.) |
| `@ts-charts/geo` | Geographic projections and path generators |
| `@ts-charts/hierarchy` | Tree, treemap, pack, and partition layouts |
| `@ts-charts/interpolate` | Value interpolation for animations |
| `@ts-charts/path` | SVG path serialization |
| `@ts-charts/polygon` | Polygon area, centroid, convex hull |
| `@ts-charts/quadtree` | 2D spatial indexing |
| `@ts-charts/random` | Random number generators for various distributions |
| `@ts-charts/scale` | Scales: linear, log, ordinal, time, etc. |
| `@ts-charts/scale-chromatic` | Color schemes: sequential, diverging, categorical |
| `@ts-charts/selection` | DOM selection and manipulation |
| `@ts-charts/shape` | Shape generators: line, area, arc, pie, stack |
| `@ts-charts/time` | Time intervals and rounding |
| `@ts-charts/time-format` | Date/time parsing and formatting |
| `@ts-charts/timer` | Efficient animation scheduling via `requestAnimationFrame` |
| `@ts-charts/transition` | Animated transitions on selections |
| `@ts-charts/zoom` | Pan and zoom interaction |

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/ts-charts/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/ts-charts/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/ts-charts?style=flat-square
[npm-version-href]: https://npmjs.com/package/ts-charts
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/ts-charts/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/ts-charts/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/ts-charts/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/ts-charts -->
