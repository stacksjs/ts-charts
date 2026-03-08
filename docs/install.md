# Installation

## Umbrella Package

Install the full library with all 30 packages:

```bash
bun add ts-charts
```

## Individual Packages

Install only what you need:

```bash
bun add @ts-charts/scale
bun add @ts-charts/shape
bun add @ts-charts/axis
bun add @ts-charts/selection
# ... any of the 30 packages
```

## Basic Usage

```ts
import { scaleLinear, extent, line } from 'ts-charts'

const data = [10, 20, 30, 40, 50]

const x = scaleLinear()
  .domain([0, data.length - 1])
  .range([0, 500])

const y = scaleLinear()
  .domain(extent(data) as [number, number])
  .range([200, 0])

const lineGenerator = line<number>()
  .x((_, i) => x(i))
  .y(d => y(d))

const pathData = lineGenerator(data)
```

## Requirements

- **Bun** >= 1.0 (recommended)
- **Node.js** >= 18 (also supported)
- **TypeScript** >= 5.0 (for full type support)
