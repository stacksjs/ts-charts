import { describe, it, expect } from 'bun:test'
import { geoEquirectangular, geoPath } from '../../src/index.ts'

const equirectangular = geoEquirectangular()
  .scale(900 / Math.PI)
  .precision(0)

function testBounds(projection: any, object: any) {
  return geoPath()
    .projection(projection)
    .bounds(object)
}

describe('geoPath.bounds', () => {
  it('geoPath.bounds(...) of a polygon with no holes', () => {
    expect(testBounds(equirectangular, {
      type: 'Polygon',
      coordinates: [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]]
    })).toEqual([[980, 245], [985, 250]])
  })

  it('geoPath.bounds(...) of a polygon with holes', () => {
    expect(testBounds(equirectangular, {
      type: 'Polygon',
      coordinates: [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]], [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
    })).toEqual([[980, 245], [985, 250]])
  })

  it('geoPath.bounds(...) of a sphere', () => {
    expect(testBounds(equirectangular, {
      type: 'Sphere'
    })).toEqual([[-420, -200], [1380, 700]])
  })
})
