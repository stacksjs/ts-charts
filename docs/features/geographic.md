# Geographic Projections

ts-charts includes a full geographic projection engine through `@ts-charts/geo`, supporting 16 projections, spherical math, clipping, and SVG/Canvas path generation.

## Projections

```ts
import {
  geoMercator,
  geoOrthographic,
  geoAlbersUsa,
  geoEquirectangular,
  geoNaturalEarth1,
  geoPath,
} from '@ts-charts/geo'

// create a Mercator projection
const projection = geoMercator()
  .scale(150)
  .translate([480, 250])

// project a coordinate [longitude, latitude] → [x, y]
projection([-122.4, 37.8]) // San Francisco → [x, y]

// invert back to coordinates
projection.invert([x, y])  // → [longitude, latitude]
```

## Available Projections

| Projection | Function | Description |
|---|---|---|
| Albers | `geoAlbers()` | Conic equal-area (US default) |
| Albers USA | `geoAlbersUsa()` | Composite: lower 48 + Alaska + Hawaii |
| Azimuthal Equal-Area | `geoAzimuthalEqualArea()` | Preserves area |
| Azimuthal Equidistant | `geoAzimuthalEquidistant()` | Preserves distance from center |
| Conic Conformal | `geoConicConformal()` | Preserves angles |
| Conic Equal-Area | `geoConicEqualArea()` | Preserves area |
| Conic Equidistant | `geoConicEquidistant()` | Preserves distance along meridians |
| Equal Earth | `geoEqualEarth()` | Equal-area, visually pleasing |
| Equirectangular | `geoEquirectangular()` | Simple plate carrée |
| Gnomonic | `geoGnomonic()` | Great circles are straight lines |
| Identity | `geoIdentity()` | No projection (planar data) |
| Mercator | `geoMercator()` | Conformal cylindrical |
| Natural Earth | `geoNaturalEarth1()` | Pseudocylindrical, compromise |
| Orthographic | `geoOrthographic()` | Globe view |
| Stereographic | `geoStereographic()` | Conformal azimuthal |
| Transverse Mercator | `geoTransverseMercator()` | Rotated Mercator |

## Path Generation

Generate SVG path strings or draw to canvas:

```ts
import { geoPath, geoMercator } from '@ts-charts/geo'

const projection = geoMercator()
const path = geoPath(projection)

// GeoJSON → SVG path string
const geojson = { type: 'Sphere' }
path(geojson) // 'M...'

// get computed properties
path.area(geojson)     // projected area in pixels²
path.bounds(geojson)   // [[x0, y0], [x1, y1]]
path.centroid(geojson) // [cx, cy]
```

## Spherical Math

```ts
import {
  geoArea,
  geoBounds,
  geoCentroid,
  geoContains,
  geoDistance,
  geoLength,
  geoInterpolate,
} from '@ts-charts/geo'

const polygon = {
  type: 'Polygon',
  coordinates: [[[-122, 37], [-122, 38], [-121, 38], [-121, 37], [-122, 37]]]
}

geoArea(polygon)     // steradians
geoBounds(polygon)   // [[west, south], [east, north]]
geoCentroid(polygon)  // [lon, lat]
geoContains(polygon, [-121.5, 37.5]) // true

// great-circle distance (radians)
geoDistance([-122.4, 37.8], [139.7, 35.7]) // SF to Tokyo

// interpolate along great circle
const interp = geoInterpolate([-122.4, 37.8], [139.7, 35.7])
interp(0.5) // midpoint coordinates
```

## Graticule

Generate meridian and parallel lines:

```ts
import { geoGraticule } from '@ts-charts/geo'

const graticule = geoGraticule()
  .step([10, 10]) // 10° grid

const grid = graticule()      // MultiLineString GeoJSON
const outline = graticule.outline() // Polygon GeoJSON
```

## Fitting to Bounds

Automatically scale and center a projection to fit a geometry:

```ts
const projection = geoMercator()
  .fitExtent([[20, 20], [940, 480]], geojson)
// or
  .fitSize([960, 500], geojson)
```
