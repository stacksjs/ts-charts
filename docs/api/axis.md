# Axis

SVG axis generators for rendering human-readable reference marks alongside scales.

## Installation

```bash
bun add @ts-charts/axis
```

## Exports

`axisTop`, `axisRight`, `axisBottom`, `axisLeft`

**Types:** `Axis`

## Usage

```ts
import { axisBottom, axisLeft } from '@ts-charts/axis'
import { scaleLinear } from '@ts-charts/scale'

const x = scaleLinear().domain([0, 100]).range([0, 500])
const xAxis = axisBottom(x).ticks(5)

const y = scaleLinear().domain([0, 50]).range([300, 0])
const yAxis = axisLeft(y).tickFormat(d => `${d}%`)
```
