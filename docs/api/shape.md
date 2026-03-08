# Shape

Shape generators for lines, areas, arcs, pies, symbols, curves, and stacks.

## Installation

```bash
bun add @ts-charts/shape
```

## Exports

### Generators
`arc`, `area`, `line`, `pie`, `areaRadial`, `lineRadial`, `pointRadial`, `link`, `linkHorizontal`, `linkVertical`, `linkRadial`

### Symbols
`symbol`, `symbols`, `symbolsFill`, `symbolsStroke`, `symbolAsterisk`, `symbolCircle`, `symbolCross`, `symbolDiamond`, `symbolDiamond2`, `symbolPlus`, `symbolSquare`, `symbolSquare2`, `symbolStar`, `symbolTriangle`, `symbolTriangle2`, `symbolWye`, `symbolTimes`, `symbolX`

### Curves
`curveBasis`, `curveBasisClosed`, `curveBasisOpen`, `curveBundle`, `curveBumpX`, `curveBumpY`, `curveCardinal`, `curveCardinalClosed`, `curveCardinalOpen`, `curveCatmullRom`, `curveCatmullRomClosed`, `curveCatmullRomOpen`, `curveLinear`, `curveLinearClosed`, `curveMonotoneX`, `curveMonotoneY`, `curveNatural`, `curveStep`, `curveStepAfter`, `curveStepBefore`

### Stacks
`stack`, `stackOffsetExpand`, `stackOffsetDiverging`, `stackOffsetNone`, `stackOffsetSilhouette`, `stackOffsetWiggle`, `stackOrderAppearance`, `stackOrderAscending`, `stackOrderDescending`, `stackOrderInsideOut`, `stackOrderNone`, `stackOrderReverse`

## Usage

```ts
import { line, area, arc, pie, curveCatmullRom } from '@ts-charts/shape'

const lineGen = line<[number, number]>()
  .x(d => d[0])
  .y(d => d[1])
  .curve(curveCatmullRom)

const areaGen = area<[number, number]>()
  .x(d => d[0])
  .y0(200)
  .y1(d => d[1])

const arcGen = arc()
  .innerRadius(0)
  .outerRadius(100)

const pieGen = pie<number>().value(d => d)
const arcs = pieGen([1, 2, 3, 4])
```
