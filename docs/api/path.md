# Path

SVG path serialization implementing the CanvasPathMethods interface.

## Installation

```bash
bun add @ts-charts/path
```

## Exports

`Path`, `path`, `pathRound`

## Usage

```ts
import { path, pathRound } from '@ts-charts/path'

const p = path()
p.moveTo(10, 10)
p.lineTo(100, 10)
p.lineTo(100, 100)
p.closePath()
p.toString()  // 'M10,10L100,10L100,100Z'

// rounded coordinates
const pr = pathRound(1)
pr.moveTo(10.456, 20.789)
pr.toString()  // 'M10.5,20.8'
```
