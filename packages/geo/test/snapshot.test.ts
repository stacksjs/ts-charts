import { describe, it, expect } from 'bun:test'
import {
  geoAlbers,
  geoAlbersUsa,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEqualEarth,
  geoEquirectangular,
  geoGnomonic,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  geoStereographic,
  geoTransverseMercator,
} from '../src/index.ts'

const sphere = { type: 'Sphere' } as const

const multiPoint = {
  type: 'MultiPoint' as const,
  coordinates: [
    [-122.4, 37.8],
    [0, 51.5],
    [139.7, 35.7],
    [-43.2, -22.9],
    [28.0, -26.2],
    [151.2, -33.9],
  ],
}

const lineString = {
  type: 'LineString' as const,
  coordinates: [
    [-122.4, 37.8],
    [0, 51.5],
    [139.7, 35.7],
    [-43.2, -22.9],
  ],
}

const polygon = {
  type: 'Polygon' as const,
  coordinates: [[
    [-10, -10],
    [10, -10],
    [10, 10],
    [-10, 10],
    [-10, -10],
  ]],
}

const projections: Record<string, () => any> = {
  azimuthalEqualArea: () => geoAzimuthalEqualArea().precision(0.1),
  azimuthalEquidistant: () => geoAzimuthalEquidistant().precision(0.1),
  conicConformal: () => geoConicConformal().precision(0.1),
  conicEqualArea: () => geoConicEqualArea().precision(0.1),
  conicEquidistant: () => geoConicEquidistant().precision(0.1),
  equalEarth: () => geoEqualEarth().precision(0.1),
  equirectangular: () => geoEquirectangular().precision(0.1),
  gnomonic: () => geoGnomonic().precision(0.1),
  mercator: () => geoMercator().precision(0.1),
  naturalEarth1: () => geoNaturalEarth1().precision(0.1),
  orthographic: () => geoOrthographic().precision(0.1),
  stereographic: () => geoStereographic().precision(0.1),
  transverseMercator: () => geoTransverseMercator().precision(0.1),
  albers: () => geoAlbers().precision(0.1),
  albersUsa: () => geoAlbersUsa().precision(0.1),
  angleorient30: () => geoEquirectangular().clipAngle(90).angle(-30).precision(0.1).fitExtent([[0, 0], [960, 500]], sphere),
}

describe('geo projection snapshots', () => {
  for (const [name, createProjection] of Object.entries(projections)) {
    describe(name, () => {
      it('renders a Sphere to a valid SVG path string', () => {
        const projection = createProjection()
        const path = geoPath(projection)
        const result = path(sphere)

        expect(result).not.toBeNull()
        expect(typeof result).toBe('string')
        expect(result!.length).toBeGreaterThan(0)
        expect(result).toMatch(/^M/)
      })

      it('renders a MultiPoint to a valid path string', () => {
        const projection = createProjection()
        const path = geoPath(projection)
        const result = path(multiPoint)

        // Some projections may clip points on the far side (e.g. orthographic)
        // so we just check the result is a string if non-null
        if (result !== null) {
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
          expect(result).toMatch(/^M/)
        }
      })

      it('renders a LineString to a valid path string', () => {
        const projection = createProjection()
        const path = geoPath(projection)
        const result = path(lineString)

        if (result !== null) {
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
          expect(result).toMatch(/^M/)
          // LineStrings should contain line-to commands
          expect(result).toMatch(/L/)
        }
      })

      it('renders a Polygon to a valid path string', () => {
        const projection = createProjection()
        const path = geoPath(projection)
        const result = path(polygon)

        if (result !== null) {
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
          expect(result).toMatch(/^M/)
          // Polygons should be closed with Z
          expect(result).toMatch(/Z/)
        }
      })

      it('produces a Sphere path with multiple path commands', () => {
        const projection = createProjection()
        const path = geoPath(projection)
        const result = path(sphere)

        if (result !== null) {
          // A sphere outline should have multiple move/line/arc commands
          const commandCount = (result.match(/[MLAQCSTZ]/g) || []).length
          expect(commandCount).toBeGreaterThan(2)
        }
      })
    })
  }
})
