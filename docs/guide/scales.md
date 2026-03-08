# Scales

Scales (from `@ts-charts/scale`) map abstract data values to visual representations like positions, colors, or sizes.

## Linear Scale

The most common scale, mapping a continuous domain to a continuous range:

```ts
import { scaleLinear } from 'ts-charts'

const x = scaleLinear()
  .domain([0, 100])
  .range([0, 800])

x(50)   // 400
x(75)   // 600
x.invert(400)  // 50
```

## Ordinal Scale

Maps discrete values to discrete outputs:

```ts
import { scaleOrdinal } from 'ts-charts'

const color = scaleOrdinal()
  .domain(['apple', 'banana', 'cherry'])
  .range(['red', 'yellow', 'crimson'])

color('banana')  // 'yellow'
```

## Band Scale

For bar charts, maps categories to equal-width bands:

```ts
import { scaleBand } from 'ts-charts'

const x = scaleBand()
  .domain(['A', 'B', 'C', 'D'])
  .range([0, 400])
  .padding(0.1)

x('B')          // position of band 'B'
x.bandwidth()   // width of each band
```

## Time Scale

Maps dates to a continuous range:

```ts
import { scaleTime } from 'ts-charts'

const x = scaleTime()
  .domain([new Date(2024, 0, 1), new Date(2024, 11, 31)])
  .range([0, 800])
```

## Other Scale Types

- `scaleLog` — logarithmic scale
- `scalePow`, `scaleSqrt` — power scales
- `scaleSequential` — for continuous color schemes
- `scaleDiverging` — for diverging color schemes
- `scaleQuantize`, `scaleQuantile`, `scaleThreshold` — for bucketing

See the full [Scale API Reference](/api/scale) for all exports.
