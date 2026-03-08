# Brush

Interactive brushing for selecting a one- or two-dimensional region.

## Installation

```bash
bun add @ts-charts/brush
```

## Exports

`brush`, `brushX`, `brushY`, `brushSelection`

## Usage

```ts
import { brush, brushX, brushSelection } from '@ts-charts/brush'

// 2D brush
const b = brush()
  .extent([[0, 0], [500, 300]])
  .on('brush', (event) => {
    const selection = event.selection
    // [[x0, y0], [x1, y1]]
  })

// 1D horizontal brush
const bx = brushX()
  .extent([[0, 0], [500, 50]])
```
