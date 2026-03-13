# Interpolate

Value interpolation for numbers, colors, strings, arrays, objects, and transforms.

## Installation

```bash
bun add @ts-charts/interpolate
```

## Exports

### Core

`interpolate`, `interpolateNumber`, `interpolateRound`, `interpolateString`, `interpolateDate`, `interpolateArray`, `interpolateNumberArray`, `interpolateObject`, `interpolateDiscrete`, `interpolateHue`

### Splines

`interpolateBasis`, `interpolateBasisClosed`

### Colors

`interpolateRgb`, `interpolateRgbBasis`, `interpolateRgbBasisClosed`, `interpolateHsl`, `interpolateHslLong`, `interpolateLab`, `interpolateHcl`, `interpolateHclLong`, `interpolateCubehelix`, `interpolateCubehelixLong`

### Transforms

`interpolateTransformCss`, `interpolateTransformSvg`, `interpolateZoom`

### Utilities

`piecewise`, `quantize`

## Usage

```ts
import { interpolateNumber, interpolateRgb, piecewise } from '@ts-charts/interpolate'

const num = interpolateNumber(0, 100)
num(0.5)  // 50

const color = interpolateRgb('red', 'blue')
color(0.5)  // 'rgb(128, 0, 128)'

const multi = piecewise(interpolateRgb, ['red', 'green', 'blue'])
multi(0.5)  // green
```
