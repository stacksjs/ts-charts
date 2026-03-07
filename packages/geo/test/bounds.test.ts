import { describe, it, expect } from 'bun:test'
import { geoBounds } from '../src/index.ts'

function assertInDelta(actual: any, expected: any, delta: number) {
  if (Array.isArray(expected)) {
    for (let i = 0; i < expected.length; i++) {
      assertInDelta(actual[i], expected[i], delta)
    }
  } else {
    expect(Math.abs(actual - expected)).toBeLessThan(delta)
  }
}

describe('geoBounds', () => {
  it('bounds: Feature', () => {
    expect(geoBounds({
      type: 'Feature',
      geometry: {
        type: 'MultiPoint',
        coordinates: [[-123, 39], [-122, 38]]
      }
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: FeatureCollection', () => {
    expect(geoBounds({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-123, 39] } },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [-122, 38] } }
      ]
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: GeometryCollection', () => {
    expect(geoBounds({
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [-123, 39] },
        { type: 'Point', coordinates: [-122, 38] }
      ]
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: LineString - simple', () => {
    expect(geoBounds({
      type: 'LineString',
      coordinates: [[-123, 39], [-122, 38]]
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: LineString - symmetry', () => {
    expect(geoBounds({
      type: 'LineString',
      coordinates: [[-30, -20], [130, 40]]
    })).toEqual(geoBounds({
      type: 'LineString',
      coordinates: [[-30, -20], [130, 40]].reverse()
    }))
  })

  it('bounds: LineString - containing coincident points', () => {
    expect(geoBounds({
      type: 'LineString',
      coordinates: [[-123, 39], [-122, 38], [-122, 38]]
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: LineString - meridian', () => {
    expect(geoBounds({
      type: 'LineString',
      coordinates: [[0, 0], [0, 1], [0, 60]]
    })).toEqual([[0, 0], [0, 60]])
  })

  it('bounds: LineString - equator', () => {
    expect(geoBounds({
      type: 'LineString',
      coordinates: [[0, 0], [1, 0], [60, 0]]
    })).toEqual([[0, 0], [60, 0]])
  })

  it('bounds: LineString - containing an inflection point in the Northern hemisphere', () => {
    assertInDelta(geoBounds({
      type: 'LineString',
      coordinates: [[-45, 60], [45, 60]]
    }), [[-45, 60], [45, 67.792345]], 1e-6)
  })

  it('bounds: LineString - containing an inflection point in the Southern hemisphere', () => {
    assertInDelta(geoBounds({
      type: 'LineString',
      coordinates: [[-45, -60], [45, -60]]
    }), [[-45, -67.792345], [45, -60]], 1e-6)
  })

  it('bounds: MultiLineString', () => {
    expect(geoBounds({
      type: 'MultiLineString',
      coordinates: [[[-123, 39], [-122, 38]]]
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: MultiPoint - simple', () => {
    expect(geoBounds({
      type: 'MultiPoint',
      coordinates: [[-123, 39], [-122, 38]]
    })).toEqual([[-123, 38], [-122, 39]])
  })

  it('bounds: MultiPoint - two points near antimeridian', () => {
    expect(geoBounds({
      type: 'MultiPoint',
      coordinates: [[-179, 39], [179, 38]]
    })).toEqual([[179, 38], [-179, 39]])
  })

  it('bounds: Point', () => {
    expect(geoBounds({
      type: 'Point',
      coordinates: [-123, 39]
    })).toEqual([[-123, 39], [-123, 39]])
  })

  it('bounds: Polygon - simple', () => {
    assertInDelta(geoBounds({
      type: 'Polygon',
      coordinates: [[[-123, 39], [-122, 39], [-122, 38], [-123, 39]]]
    }), [[-123, 38], [-122, 39.001067]], 1e-6)
  })

  it('bounds: Polygon - South pole', () => {
    expect(geoBounds({
      type: 'Polygon',
      coordinates: [[[-60, -80], [60, -80], [180, -80], [-60, -80]]]
    })).toEqual([[-180, -90], [180, -80]])
  })

  it('bounds: Sphere', () => {
    expect(geoBounds({ type: 'Sphere' })).toEqual([[-180, -90], [180, 90]])
  })

  it('bounds: null geometries - Feature', () => {
    const b = geoBounds({ type: 'Feature', geometry: null })
    expect(isNaN(b[0][0])).toBe(true)
    expect(isNaN(b[0][1])).toBe(true)
    expect(isNaN(b[1][0])).toBe(true)
    expect(isNaN(b[1][1])).toBe(true)
  })

  it('bounds: null geometries - MultiPoint', () => {
    const b = geoBounds({ type: 'MultiPoint', coordinates: [] })
    expect(isNaN(b[0][0])).toBe(true)
    expect(isNaN(b[0][1])).toBe(true)
    expect(isNaN(b[1][0])).toBe(true)
    expect(isNaN(b[1][1])).toBe(true)
  })

  it('bounds: null geometries - MultiLineString', () => {
    const b = geoBounds({ type: 'MultiLineString', coordinates: [] })
    expect(isNaN(b[0][0])).toBe(true)
    expect(isNaN(b[0][1])).toBe(true)
    expect(isNaN(b[1][0])).toBe(true)
    expect(isNaN(b[1][1])).toBe(true)
  })

  it('bounds: null geometries - MultiPolygon', () => {
    const b = geoBounds({ type: 'MultiPolygon', coordinates: [] })
    expect(isNaN(b[0][0])).toBe(true)
    expect(isNaN(b[0][1])).toBe(true)
    expect(isNaN(b[1][0])).toBe(true)
    expect(isNaN(b[1][1])).toBe(true)
  })
})
