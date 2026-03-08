# Scale

Scales map abstract data values to visual representations.

## Installation

```bash
bun add @ts-charts/scale
```

## Exports

### Continuous
`scaleLinear`, `scaleLog`, `scalePow`, `scaleSqrt`, `scaleSymlog`, `scaleRadial`, `scaleIdentity`, `scaleTime`, `scaleUtc`

### Sequential
`scaleSequential`, `scaleSequentialLog`, `scaleSequentialPow`, `scaleSequentialSqrt`, `scaleSequentialSymlog`, `scaleSequentialQuantile`

### Diverging
`scaleDiverging`, `scaleDivergingLog`, `scaleDivergingPow`, `scaleDivergingSqrt`, `scaleDivergingSymlog`

### Ordinal
`scaleOrdinal`, `scaleImplicit`, `scaleBand`, `scalePoint`

### Discretizing
`scaleQuantize`, `scaleQuantile`, `scaleThreshold`

### Utilities
`tickFormat`

## Usage

```ts
import { scaleLinear, scaleBand, scaleSequential } from '@ts-charts/scale'
import { interpolateViridis } from '@ts-charts/scale-chromatic'

const x = scaleLinear().domain([0, 100]).range([0, 800])
x(50)  // 400

const band = scaleBand()
  .domain(['A', 'B', 'C'])
  .range([0, 300])
  .padding(0.1)

const color = scaleSequential(interpolateViridis)
  .domain([0, 100])
color(50)  // color midpoint
```
