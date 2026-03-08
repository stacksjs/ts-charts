# Browser Support

ts-charts targets modern browsers and Bun. All packages produce pure ESM output with no CommonJS fallback.

## Supported Environments

| Environment | Version | Notes |
|---|---|---|
| Chrome | 80+ | Full support |
| Firefox | 80+ | Full support |
| Safari | 14+ | Full support |
| Edge | 80+ | Full support (Chromium-based) |
| Bun | 1.0+ | First-class target |
| Node.js | 18+ | Works via ESM |

## ESM Only

All packages use `"type": "module"` and export ESM exclusively:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

If your project still uses CommonJS, you'll need a bundler that handles ESM imports or use dynamic `import()`.

## DOM Packages

Some packages require a DOM environment:

| Package | Requires DOM |
|---|---|
| `@ts-charts/selection` | Yes |
| `@ts-charts/transition` | Yes |
| `@ts-charts/brush` | Yes |
| `@ts-charts/drag` | Yes |
| `@ts-charts/zoom` | Yes |
| `@ts-charts/axis` | Yes (uses selection) |

All other packages (scales, shapes, arrays, geo, etc.) are pure computation and work in any JavaScript environment, including workers and server-side rendering.

## Server-Side Rendering

For SSR, the computation packages work directly. For DOM-dependent packages, use a DOM shim:

```ts
// Pure computation — works anywhere
import { scaleLinear } from '@ts-charts/scale'
import { line } from '@ts-charts/shape'
import { geoMercator, geoPath } from '@ts-charts/geo'

const x = scaleLinear().domain([0, 100]).range([0, 960])
const pathGenerator = line().x(d => x(d[0])).y(d => d[1])

// DOM manipulation — needs a DOM environment
import { Window } from 'very-happy-dom'
const win = new Window()
globalThis.document = win.document

import { select } from '@ts-charts/selection'
const svg = select(document.body).append('svg')
```

## Web Workers

Pure computation packages work in Web Workers without modification:

```ts
// worker.ts
import { scaleLinear } from '@ts-charts/scale'
import { contours } from '@ts-charts/contour'
import { forceSimulation, forceManyBody } from '@ts-charts/force'

self.onmessage = (e) => {
  const { data, width, height } = e.data
  const result = contours().size([width, height])(data)
  self.postMessage(result)
}
```

## Build Targets

When building for the browser with Bun:

```ts
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  target: 'browser', // ensures browser-compatible output
  format: 'esm',
  minify: true,
})
```

For other bundlers, no special configuration is needed — standard ESM resolution works.
