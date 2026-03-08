# Delaunay

Delaunay triangulation and Voronoi diagram computation.

## Installation

```bash
bun add @ts-charts/delaunay
```

## Exports

`Delaunay`, `Voronoi`

## Usage

```ts
import { Delaunay } from '@ts-charts/delaunay'

const points = [[0, 0], [100, 0], [50, 100], [75, 50]]
const delaunay = Delaunay.from(points)

// access triangles
delaunay.triangles  // flat array of point indices

// find nearest point
delaunay.find(60, 40)  // index of nearest point

// compute Voronoi diagram
const voronoi = delaunay.voronoi([0, 0, 200, 200])
voronoi.cellPolygon(0)  // polygon for point 0
voronoi.render()        // SVG path for all edges
```
