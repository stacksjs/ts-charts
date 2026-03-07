import { describe, it, expect } from 'bun:test'
import { geoPath } from '../../src/index.ts'

describe('geoPath.measure', () => {
  it('geoPath.measure(...) of a Point', () => {
    expect(geoPath().measure({
      type: 'Point',
      coordinates: [0, 0]
    })).toBe(0)
  })

  it('geoPath.measure(...) of a MultiPoint', () => {
    expect(geoPath().measure({
      type: 'MultiPoint',
      coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]]
    })).toBe(0)
  })

  it('geoPath.measure(...) of a LineString', () => {
    expect(geoPath().measure({
      type: 'LineString',
      coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]]
    })).toBe(3)
  })

  it('geoPath.measure(...) of a MultiLineString', () => {
    expect(geoPath().measure({
      type: 'MultiLineString',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0]]]
    })).toBe(3)
  })

  it('geoPath.measure(...) of a Polygon', () => {
    expect(geoPath().measure({
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
    })).toBe(4)
  })

  it('geoPath.measure(...) of a Polygon with a hole', () => {
    expect(geoPath().measure({
      type: 'Polygon',
      coordinates: [[[-1, -1], [-1, 2], [2, 2], [2, -1], [-1, -1]], [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
    })).toBe(16)
  })

  it('geoPath.measure(...) of a MultiPolygon', () => {
    expect(geoPath().measure({
      type: 'MultiPolygon',
      coordinates: [[[[-1, -1], [-1, 2], [2, 2], [2, -1], [-1, -1]]], [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
    })).toBe(16)
  })
})
