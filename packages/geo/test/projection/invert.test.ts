import { describe, it } from 'bun:test'
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
  geoOrthographic,
  geoStereographic,
  geoTransverseMercator
} from '../../src/index.ts'
import { assertProjectionEqual } from '../helpers/projectionAsserts.ts'

describe('projection invert', () => {
  const factories: Array<{ name: string, factory: () => any }> = [
    { name: 'geoAlbers', factory: geoAlbers },
    { name: 'geoAzimuthalEqualArea', factory: geoAzimuthalEqualArea },
    { name: 'geoAzimuthalEquidistant', factory: geoAzimuthalEquidistant },
    { name: 'geoConicConformal', factory: geoConicConformal },
    { name: 'conicConformal(20,30)', factory: () => geoConicConformal().parallels([20, 30]) },
    { name: 'conicConformal(30,30)', factory: () => geoConicConformal().parallels([30, 30]) },
    { name: 'conicConformal(-35,-50)', factory: () => geoConicConformal().parallels([-35, -50]) },
    { name: 'conicConformal(40,60)', factory: () => geoConicConformal().parallels([40, 60]).rotate([-120, 0]) },
    { name: 'geoConicEqualArea', factory: geoConicEqualArea },
    { name: 'conicEqualArea(20,30)', factory: () => geoConicEqualArea().parallels([20, 30]) },
    { name: 'conicEqualArea(-30,30)', factory: () => geoConicEqualArea().parallels([-30, 30]) },
    { name: 'conicEqualArea(-35,-50)', factory: () => geoConicEqualArea().parallels([-35, -50]) },
    { name: 'conicEqualArea(40,60)', factory: () => geoConicEqualArea().parallels([40, 60]).rotate([-120, 0]) },
    { name: 'geoConicEquidistant', factory: geoConicEquidistant },
    { name: 'conicEquidistant(20,30)', factory: () => geoConicEquidistant().parallels([20, 30]) },
    { name: 'conicEquidistant(30,30)', factory: () => geoConicEquidistant().parallels([30, 30]) },
    { name: 'conicEquidistant(-35,-50)', factory: () => geoConicEquidistant().parallels([-35, -50]) },
    { name: 'conicEquidistant(40,60)', factory: () => geoConicEquidistant().parallels([40, 60]).rotate([-120, 0]) },
    { name: 'geoEquirectangular', factory: geoEquirectangular },
    { name: 'geoEqualEarth', factory: geoEqualEarth },
    { name: 'geoGnomonic', factory: geoGnomonic },
    { name: 'geoMercator', factory: geoMercator },
    { name: 'geoOrthographic', factory: geoOrthographic },
    { name: 'geoStereographic', factory: geoStereographic },
    { name: 'geoTransverseMercator', factory: geoTransverseMercator },
  ]

  for (const { name, factory } of factories) {
    it(`${name}(point) and ${name}.invert(point) are symmetric`, () => {
      const projection = factory()
      for (const point of [[0, 0], [30.3, 24.1], [-10, 42], [-2, -5]]) {
        assertProjectionEqual(projection, point, projection(point)!)
      }
    })
  }

  it('albersUsa(point) and albersUsa.invert(point) are symmetric', () => {
    const projection = geoAlbersUsa()
    for (const point of [[-122.4194, 37.7749], [-74.0059, 40.7128], [-149.9003, 61.2181], [-157.8583, 21.3069]]) {
      assertProjectionEqual(projection, point, projection(point)!)
    }
  })
})
