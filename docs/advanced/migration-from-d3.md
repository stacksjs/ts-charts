# Migration from D3

ts-charts is a 1:1 TypeScript port of D3.js. Most code migrates with minimal changes — primarily updating import paths.

## Import Changes

### Before (D3)

```js
import { scaleLinear } from 'd3-scale'
import { line, area } from 'd3-shape'
import { select } from 'd3-selection'
import * as d3 from 'd3'
```

### After (ts-charts)

```ts
// individual packages
import { scaleLinear } from '@ts-charts/scale'
import { line, area } from '@ts-charts/shape'
import { select } from '@ts-charts/selection'

// or umbrella
import { scaleLinear, line, select } from 'ts-charts'
```

## Package Name Mapping

Every D3 package maps directly:

| D3 Package | ts-charts Package |
|---|---|
| `d3-array` | `@ts-charts/array` |
| `d3-axis` | `@ts-charts/axis` |
| `d3-brush` | `@ts-charts/brush` |
| `d3-chord` | `@ts-charts/chord` |
| `d3-color` | `@ts-charts/color` |
| `d3-contour` | `@ts-charts/contour` |
| `d3-delaunay` | `@ts-charts/delaunay` |
| `d3-dispatch` | `@ts-charts/dispatch` |
| `d3-drag` | `@ts-charts/drag` |
| `d3-dsv` | `@ts-charts/dsv` |
| `d3-ease` | `@ts-charts/ease` |
| `d3-fetch` | `@ts-charts/fetch` |
| `d3-force` | `@ts-charts/force` |
| `d3-format` | `@ts-charts/format` |
| `d3-geo` | `@ts-charts/geo` |
| `d3-hierarchy` | `@ts-charts/hierarchy` |
| `d3-interpolate` | `@ts-charts/interpolate` |
| `d3-path` | `@ts-charts/path` |
| `d3-polygon` | `@ts-charts/polygon` |
| `d3-quadtree` | `@ts-charts/quadtree` |
| `d3-random` | `@ts-charts/random` |
| `d3-scale` | `@ts-charts/scale` |
| `d3-scale-chromatic` | `@ts-charts/scale-chromatic` |
| `d3-selection` | `@ts-charts/selection` |
| `d3-shape` | `@ts-charts/shape` |
| `d3-time` | `@ts-charts/time` |
| `d3-time-format` | `@ts-charts/time-format` |
| `d3-timer` | `@ts-charts/timer` |
| `d3-transition` | `@ts-charts/transition` |
| `d3-zoom` | `@ts-charts/zoom` |

## API Compatibility

All public APIs are preserved. Function signatures, method chains, and callback patterns work identically:

```ts
// This D3 code...
const svg = d3.select('body').append('svg')
  .attr('width', 960)
  .attr('height', 500)

const x = d3.scaleLinear().domain([0, 100]).range([0, 960])

// ...works the same in ts-charts:
import { select } from '@ts-charts/selection'
import { scaleLinear } from '@ts-charts/scale'

const svg = select('body').append('svg')
  .attr('width', 960)
  .attr('height', 500)

const x = scaleLinear().domain([0, 100]).range([0, 960])
```

## TypeScript Benefits

After migrating, you get full type safety that D3's `@types/d3-*` packages approximate but ts-charts provides natively:

```ts
import { scaleLinear } from '@ts-charts/scale'

const x = scaleLinear().domain([0, 100]).range([0, 960])
x.domain() // type: number[]
x(50)      // type: number

// Type errors caught at compile time
x.domain(['a', 'b']) // Error: string not assignable to number
```

## External Dependencies

ts-charts has zero external runtime dependencies. Two small libraries that D3 depends on (`internmap` and `delaunator`) are inlined as internal packages. You no longer need to install them separately.

## Callback `this` Context

D3 uses `function() { this... }` for DOM callbacks. ts-charts preserves this pattern with typed `this` parameters:

```ts
import { select } from '@ts-charts/selection'

// Arrow functions won't have `this` bound (same as D3)
select('circle').attr('r', function(this: SVGCircleElement) {
  return this.getAttribute('data-radius')
})
```

## Find and Replace

For most projects, a simple find-and-replace handles the migration:

```bash
# Replace D3 imports with ts-charts equivalents
sed -i "s/from 'd3-/from '@ts-charts\//g" src/**/*.ts
sed -i "s/from 'd3'/from 'ts-charts'/g" src/**/*.ts

# Update package.json dependencies
# Remove d3-* packages, add @ts-charts/* packages
```
