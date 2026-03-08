# Shapes

Shape generators (from `@ts-charts/shape`) produce SVG path data from your data.

## Lines

```ts
import { line } from 'ts-charts'

const lineGen = line<[number, number]>()
  .x(d => d[0])
  .y(d => d[1])

const path = lineGen([[0, 80], [100, 40], [200, 60], [300, 20]])
// returns an SVG path string like 'M0,80L100,40L200,60L300,20'
```

## Areas

```ts
import { area } from 'ts-charts'

const areaGen = area<[number, number]>()
  .x(d => d[0])
  .y0(200)
  .y1(d => d[1])

areaGen([[0, 80], [100, 40], [200, 60]])
```

## Arcs

For pie and donut charts:

```ts
import { arc, pie } from 'ts-charts'

const arcGen = arc()
  .innerRadius(0)
  .outerRadius(100)

const pieGen = pie<number>().value(d => d)
const arcs = pieGen([1, 2, 3, 4])

arcs.map(d => arcGen(d))
```

## Curves

Apply interpolation curves to lines and areas:

```ts
import { line, curveCatmullRom, curveStep } from 'ts-charts'

const smoothLine = line<[number, number]>()
  .curve(curveCatmullRom)
  .x(d => d[0])
  .y(d => d[1])
```

## Symbols

Predefined symbol shapes for scatter plots:

```ts
import { symbol, symbolCircle, symbolCross, symbolStar } from 'ts-charts'

const sym = symbol().type(symbolStar).size(200)
sym()  // returns SVG path string for a star
```

## Stacks

For stacked charts:

```ts
import { stack } from 'ts-charts'

const stackGen = stack()
  .keys(['apples', 'bananas', 'cherries'])

const series = stackGen(data)
```

See the full [Shape API Reference](/api/shape) for all exports.
