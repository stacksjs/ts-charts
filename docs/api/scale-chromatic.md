# Scale Chromatic

Color schemes and palettes for use with scales.

## Installation

```bash
bun add @ts-charts/scale-chromatic
```

## Exports

### Categorical
`schemeCategory10`, `schemeAccent`, `schemeDark2`, `schemeObservable10`, `schemePaired`, `schemePastel1`, `schemePastel2`, `schemeSet1`, `schemeSet2`, `schemeSet3`, `schemeTableau10`

### Diverging
`interpolateBrBG`, `schemeBrBG`, `interpolatePRGn`, `schemePRGn`, `interpolatePiYG`, `schemePiYG`, `interpolatePuOr`, `schemePuOr`, `interpolateRdBu`, `schemeRdBu`, `interpolateRdGy`, `schemeRdGy`, `interpolateRdYlBu`, `schemeRdYlBu`, `interpolateRdYlGn`, `schemeRdYlGn`, `interpolateSpectral`, `schemeSpectral`

### Sequential (Multi-Hue)
`interpolateBuGn`, `schemeBuGn`, `interpolateBuPu`, `schemeBuPu`, `interpolateGnBu`, `schemeGnBu`, `interpolateOrRd`, `schemeOrRd`, `interpolatePuBuGn`, `schemePuBuGn`, `interpolatePuBu`, `schemePuBu`, `interpolatePuRd`, `schemePuRd`, `interpolateRdPu`, `schemeRdPu`, `interpolateYlGnBu`, `schemeYlGnBu`, `interpolateYlGn`, `schemeYlGn`, `interpolateYlOrBr`, `schemeYlOrBr`, `interpolateYlOrRd`, `schemeYlOrRd`, `interpolateCividis`, `interpolateCubehelixDefault`, `interpolateRainbow`, `interpolateWarm`, `interpolateCool`, `interpolateSinebow`, `interpolateTurbo`, `interpolateViridis`, `interpolateMagma`, `interpolateInferno`, `interpolatePlasma`

### Sequential (Single-Hue)
`interpolateBlues`, `schemeBlues`, `interpolateGreens`, `schemeGreens`, `interpolateGreys`, `schemeGreys`, `interpolatePurples`, `schemePurples`, `interpolateReds`, `schemeReds`, `interpolateOranges`, `schemeOranges`

## Usage

```ts
import { schemeCategory10, interpolateViridis, schemeBlues } from '@ts-charts/scale-chromatic'

schemeCategory10[0]     // '#1f77b4'
interpolateViridis(0.5) // color at midpoint
schemeBlues[9]          // array of 9 blue shades
```
