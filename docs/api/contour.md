# Contour

Contour polygon generation and density estimation for gridded or point data.

## Installation

```bash
bun add @ts-charts/contour
```

## Exports

`contours`, `contourDensity`

## Usage

```ts
import { contours, contourDensity } from '@ts-charts/contour'

// compute contours from gridded data
const c = contours()
  .size([width, height])
  .thresholds([0.5, 1, 1.5])

const polygons = c(values)

// density estimation from point data
const density = contourDensity()
  .x(d => d.x)
  .y(d => d.y)
  .size([width, height])

const densityPolygons = density(points)
```
