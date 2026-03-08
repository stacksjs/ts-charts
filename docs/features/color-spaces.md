# Color Spaces

ts-charts provides comprehensive color space support through `@ts-charts/color` and `@ts-charts/scale-chromatic`, supporting RGB, HSL, Lab, HCL, and Cubehelix color spaces with perceptually uniform interpolation.

## Supported Color Spaces

### RGB

The standard web color space:

```ts
import { rgb } from '@ts-charts/color'

const red = rgb(255, 0, 0)
const fromHex = rgb('#ff6347')
const fromCss = rgb('steelblue')

red.formatHex()  // '#ff0000'
red.formatRgb()  // 'rgb(255, 0, 0)'
red.brighter(1)  // lighter red
red.darker(0.5)  // darker red
```

### HSL

Hue-saturation-lightness, useful for generating color variations:

```ts
import { hsl } from '@ts-charts/color'

const blue = hsl(240, 1, 0.5)
blue.h // 240 (hue in degrees)
blue.s // 1 (saturation 0-1)
blue.l // 0.5 (lightness 0-1)

// rotate hue to get different colors
const green = hsl(120, 1, 0.5)
const orange = hsl(30, 1, 0.5)
```

### Lab (CIELAB)

Perceptually uniform color space — equal distances correspond to equal perceived differences:

```ts
import { lab } from '@ts-charts/color'

const a = lab(50, 40, -20)
a.l // 50 (lightness 0-100)
a.a // 40 (green-red axis)
a.b // -20 (blue-yellow axis)

// perceptually uniform brightening
const lighter = a.brighter(1)
```

### HCL (CIELCH)

Cylindrical form of Lab — hue, chroma, lightness:

```ts
import { hcl } from '@ts-charts/color'

const c = hcl(300, 50, 70)
c.h // 300 (hue angle)
c.c // 50 (chroma / saturation)
c.l // 70 (lightness)
```

### Cubehelix

Dave Green's Cubehelix color scheme — monotonically increasing luminance:

```ts
import { cubehelix } from '@ts-charts/color'

const c = cubehelix(300, 0.5, 0.5)
c.h // 300 (hue)
c.s // 0.5 (saturation)
c.l // 0.5 (lightness)
```

## Color Interpolation

Interpolate between colors in any color space:

```ts
import { interpolateRgb, interpolateHsl, interpolateLab, interpolateHcl, interpolateCubehelix } from '@ts-charts/interpolate'

// RGB interpolation (can go through muddy grays)
const rgbMix = interpolateRgb('red', 'blue')
rgbMix(0.5) // 'rgb(128, 0, 128)'

// Lab interpolation (perceptually uniform)
const labMix = interpolateLab('red', 'blue')
labMix(0.5) // perceptually halfway between

// Cubehelix with long arc
import { interpolateCubehelixLong } from '@ts-charts/interpolate'
const rainbow = interpolateCubehelixLong('red', 'blue')
```

## Color Schemes

`@ts-charts/scale-chromatic` provides ready-to-use color schemes:

```ts
import {
  schemeCategory10,      // 10 categorical colors
  schemeTableau10,       // Tableau's 10 colors
  interpolateViridis,    // perceptually uniform sequential
  interpolateInferno,    // sequential (dark)
  interpolatePlasma,     // sequential (vibrant)
  interpolateRdYlBu,     // diverging red-yellow-blue
  interpolateSpectral,   // diverging spectral
} from '@ts-charts/scale-chromatic'

// use with scales
import { scaleSequential, scaleOrdinal } from '@ts-charts/scale'

const heat = scaleSequential(interpolateInferno).domain([0, 100])
heat(50) // returns a color string

const category = scaleOrdinal(schemeCategory10)
category('A') // first categorical color
```
