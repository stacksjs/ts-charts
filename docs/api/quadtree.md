# Quadtree

Two-dimensional recursive spatial subdivision for efficient point queries.

## Installation

```bash
bun add @ts-charts/quadtree
```

## Exports

`quadtree`, `Quadtree`

**Types:** `Accessor`, `QuadtreeInternalNode`, `QuadtreeLeaf`, `QuadtreeNode`, `QuadtreeNodeCallback`

## Usage

```ts
import { quadtree } from '@ts-charts/quadtree'

const data = [[0, 0], [50, 50], [100, 20], [80, 70]]

const qt = quadtree()
  .x(d => d[0])
  .y(d => d[1])
  .addAll(data)

// find nearest point
qt.find(60, 40)  // [50, 50]

// find nearest within radius
qt.find(60, 40, 20)  // [50, 50] or undefined
```
