# Type Safety

ts-charts is built with TypeScript's strictest settings, including `isolatedDeclarations: true`. Every function has explicit parameter and return types, making the entire API self-documenting and IDE-friendly.

## Strict TypeScript

The entire codebase compiles under these settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "isolatedDeclarations": true,
    "verbatimModuleSyntax": true
  }
}
```

## Typed Scales

Scales carry their domain and range types through the API:

```ts
import { scaleLinear, scaleOrdinal } from '@ts-charts/scale'

// numeric → numeric
const x = scaleLinear()
  .domain([0, 100])
  .range([0, 960])

const px: number = x(50) // 480

// string → string
const color = scaleOrdinal()
  .domain(['apple', 'banana', 'cherry'])
  .range(['red', 'yellow', 'pink'])

const c: string = color('apple') // 'red'
```

## Typed Selections

DOM selections maintain element types through method chains:

```ts
import { select, selectAll } from '@ts-charts/selection'

// selection is typed to the element
const svg = select('svg')
  .attr('width', 960)
  .attr('height', 500)

// data joins preserve datum types
interface Point { x: number, y: number }

selectAll('circle')
  .data<Point>([{ x: 10, y: 20 }, { x: 30, y: 40 }])
  .attr('cx', (d) => d.x) // d is typed as Point
  .attr('cy', (d) => d.y)
```

## Typed Shape Generators

Shape generators have typed accessor functions:

```ts
import { line, area } from '@ts-charts/shape'

interface Datum {
  date: Date
  value: number
}

const myLine = line<Datum>()
  .x((d) => d.date.getTime()) // d is Datum
  .y((d) => d.value)

const myArea = area<Datum>()
  .x((d) => d.date.getTime())
  .y0(0)
  .y1((d) => d.value)
```

## Typed Color Spaces

Color objects carry their space through operations:

```ts
import { rgb, hsl, lab } from '@ts-charts/color'

const red = rgb(255, 0, 0)
red.r // number
red.opacity // number

const bright = red.brighter(1.5) // returns Rgb
const css = bright.formatHex() // '#ff6666'

const labColor = lab(50, 40, -20)
labColor.l // number (lightness)
labColor.a // number (green-red)
labColor.b // number (blue-yellow)
```

## Isolated Declarations

Because ts-charts uses `isolatedDeclarations: true`, all exported functions have explicit return types. This means:

- **Faster builds** — declaration files can be generated without type inference
- **Better IDE performance** — types are resolved instantly
- **Self-documenting API** — every function signature tells you exactly what it returns
