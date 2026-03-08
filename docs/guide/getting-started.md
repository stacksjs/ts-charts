# Getting Started

This guide walks you through the basics of ts-charts with practical examples.

## Creating a Scale

Scales map data values to visual values (positions, colors, sizes):

```ts
import { scaleLinear } from 'ts-charts'

const x = scaleLinear()
  .domain([0, 100])   // data range
  .range([0, 800])     // pixel range

x(50)  // 400
x(75)  // 600
```

## Formatting Numbers

Use the format package for locale-aware number formatting:

```ts
import { format, formatPrefix } from 'ts-charts'

const f = format('.2f')
f(3.14159)  // '3.14'

const p = formatPrefix('.1', 1e6)
p(1234567)  // '1.2M'
```

## Working with Arrays

Statistical and data manipulation functions:

```ts
import { mean, extent, group, bin } from 'ts-charts'

const data = [3, 1, 4, 1, 5, 9, 2, 6]

mean(data)    // 3.875
extent(data)  // [1, 9]

// group data by a key
const people = [
  { name: 'Alice', dept: 'Eng' },
  { name: 'Bob', dept: 'Sales' },
  { name: 'Carol', dept: 'Eng' },
]
const byDept = group(people, d => d.dept)
// Map { 'Eng' => [...], 'Sales' => [...] }

// create histogram bins
const histogram = bin().thresholds(5)
histogram(data)
```

## Using Interpolators

Interpolators create smooth transitions between values:

```ts
import { interpolateNumber, interpolateRgb } from 'ts-charts'

const num = interpolateNumber(0, 100)
num(0.5)  // 50

const color = interpolateRgb('red', 'blue')
color(0.5)  // 'rgb(128, 0, 128)'
```

## Generating Shapes

Create SVG path data for common shapes:

```ts
import { arc, pie, line, area } from 'ts-charts'

// create an arc generator
const arcGen = arc()
  .innerRadius(50)
  .outerRadius(100)
  .startAngle(0)
  .endAngle(Math.PI / 2)

const pathData = arcGen()

// create a line from data points
const lineGen = line<[number, number]>()
  .x(d => d[0])
  .y(d => d[1])

const linePath = lineGen([[0, 0], [50, 100], [100, 50]])
```

## Next Steps

- Read [Why ts-charts?](/guide/why) to understand the motivation
- Explore the [API Reference](/api/overview) for all 30 packages
- Check out [Scales](/guide/scales), [Shapes](/guide/shapes), and [Selections](/guide/selections) guides
