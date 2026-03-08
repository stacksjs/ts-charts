# Geo

Geographic projections, path generators, and spherical geometry.

## Installation

```bash
bun add @ts-charts/geo
```

## Exports

### Projections
`geoAlbers`, `geoAlbersUsa`, `geoAzimuthalEqualArea`, `geoAzimuthalEquidistant`, `geoConicConformal`, `geoConicEqualArea`, `geoConicEquidistant`, `geoEqualEarth`, `geoEquirectangular`, `geoGnomonic`, `geoIdentity`, `geoMercator`, `geoNaturalEarth1`, `geoOrthographic`, `geoStereographic`, `geoTransverseMercator`, `geoProjection`, `geoProjectionMutator`

### Raw Projections
`geoAzimuthalEqualAreaRaw`, `geoAzimuthalEquidistantRaw`, `geoConicConformalRaw`, `geoConicEqualAreaRaw`, `geoConicEquidistantRaw`, `geoEqualEarthRaw`, `geoEquirectangularRaw`, `geoGnomonicRaw`, `geoMercatorRaw`, `geoNaturalEarth1Raw`, `geoOrthographicRaw`, `geoStereographicRaw`, `geoTransverseMercatorRaw`

### Geometry
`geoArea`, `geoBounds`, `geoCentroid`, `geoCircle`, `geoContains`, `geoDistance`, `geoGraticule`, `geoGraticule10`, `geoInterpolate`, `geoLength`, `geoPath`, `geoRotation`, `geoStream`, `geoTransform`

### Clipping
`geoClipAntimeridian`, `geoClipCircle`, `geoClipExtent`, `geoClipRectangle`

## Usage

```ts
import { geoMercator, geoPath } from '@ts-charts/geo'

const projection = geoMercator()
  .center([0, 20])
  .scale(150)
  .translate([400, 300])

const path = geoPath(projection)
path(geojsonFeature)  // SVG path string
```
