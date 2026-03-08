# Color

Color space representations and conversions: RGB, HSL, Lab, HCL, and Cubehelix.

## Installation

```bash
bun add @ts-charts/color
```

## Exports

`color`, `rgb`, `hsl`, `lab`, `hcl`, `lch`, `gray`, `cubehelix`

**Classes:** `Color`, `Rgb`, `Hsl`, `Lab`, `Hcl`, `Cubehelix`

## Usage

```ts
import { color, rgb, hsl, lab } from '@ts-charts/color'

const c = color('steelblue')
c.opacity  // 1

const r = rgb(255, 127, 0)
r.toString()  // 'rgb(255, 127, 0)'

const h = hsl('steelblue')
h.h  // hue in degrees
h.s  // saturation
h.l  // lightness

const l = lab('steelblue')
l.l  // L* lightness
l.a  // a* green-red
l.b  // b* blue-yellow
```
