import { describe, it, expect } from 'bun:test'
import { geoEquirectangular, geoPath } from '../../src/index.ts'

const equirectangular = geoEquirectangular()
  .scale(900 / Math.PI)
  .precision(0)

function testArea(projection: any, object: any) {
  return geoPath()
    .projection(projection)
    .area(object)
}

describe('geoPath.area', () => {
  it('geoPath.area(...) of a polygon with no holes', () => {
    expect(testArea(equirectangular, {
      type: 'Polygon',
      coordinates: [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]]
    })).toBe(25)
  })

  it('geoPath.area(...) of a polygon with holes', () => {
    expect(testArea(equirectangular, {
      type: 'Polygon',
      coordinates: [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]], [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
    })).toBe(16)
  })

  it('geoPath.area(...) of a sphere', () => {
    expect(testArea(equirectangular, {
      type: 'Sphere',
    })).toBe(1620000)
  })
})
