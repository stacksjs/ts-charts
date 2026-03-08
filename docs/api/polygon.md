# Polygon

Two-dimensional polygon geometry operations.

## Installation

```bash
bun add @ts-charts/polygon
```

## Exports

`polygonArea`, `polygonCentroid`, `polygonHull`, `polygonContains`, `polygonLength`

## Usage

```ts
import { polygonArea, polygonCentroid, polygonHull, polygonContains } from '@ts-charts/polygon'

const polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]

polygonArea(polygon)      // 10000 (signed area)
polygonCentroid(polygon)  // [50, 50]
polygonContains(polygon, [50, 50])  // true

const points = [[0, 0], [100, 0], [50, 80], [30, 40], [80, 20]]
polygonHull(points)  // convex hull vertices
```
