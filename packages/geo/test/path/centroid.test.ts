import { describe, it, expect } from 'bun:test'
import { geoEquirectangular, geoPath } from '../../src/index.ts'
import { assertInDelta } from '../helpers/asserts.ts'

const equirectangular = geoEquirectangular()
  .scale(900 / Math.PI)
  .precision(0)

function testCentroid(projection: any, object: any) {
  return geoPath()
    .projection(projection)
    .centroid(object)
}

describe('geoPath.centroid', () => {
  it('geoPath.centroid(...) of a point', () => {
    expect(testCentroid(equirectangular, { type: 'Point', coordinates: [0, 0] })).toEqual([480, 250])
  })

  it('geoPath.centroid(...) of an empty multipoint', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPoint', coordinates: [] }).every(isNaN)).toBe(true)
  })

  it('geoPath.centroid(...) of a singleton multipoint', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPoint', coordinates: [[0, 0]] })).toEqual([480, 250])
  })

  it('geoPath.centroid(...) of a multipoint with two points', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPoint', coordinates: [[-122, 37], [-74, 40]] })).toEqual([-10, 57.5])
  })

  it('geoPath.centroid(...) of an empty linestring', () => {
    expect(testCentroid(equirectangular, { type: 'LineString', coordinates: [] }).every(isNaN)).toBe(true)
  })

  it('geoPath.centroid(...) of a linestring with two points', () => {
    expect(testCentroid(equirectangular, { type: 'LineString', coordinates: [[100, 0], [0, 0]] })).toEqual([730, 250])
    expect(testCentroid(equirectangular, { type: 'LineString', coordinates: [[0, 0], [100, 0], [101, 0]] })).toEqual([732.5, 250])
  })

  it('geoPath.centroid(...) of a linestring with two points, one unique', () => {
    expect(testCentroid(equirectangular, { type: 'LineString', coordinates: [[-122, 37], [-122, 37]] })).toEqual([-130, 65])
    expect(testCentroid(equirectangular, { type: 'LineString', coordinates: [[-74, 40], [-74, 40]] })).toEqual([110, 50])
  })

  it('geoPath.centroid(...) of a linestring with three points; two unique', () => {
    expect(testCentroid(equirectangular, { type: 'LineString', coordinates: [[-122, 37], [-74, 40], [-74, 40]] })).toEqual([-10, 57.5])
  })

  it('geoPath.centroid(...) of a linestring with three points', () => {
    assertInDelta(testCentroid(equirectangular, { type: 'LineString', coordinates: [[-122, 37], [-74, 40], [-100, 0]] }), [17.389135, 103.563545], 1e-6)
  })

  it('geoPath.centroid(...) of a multilinestring', () => {
    expect(testCentroid(equirectangular, { type: 'MultiLineString', coordinates: [[[100, 0], [0, 0]], [[-10, 0], [0, 0]]] })).toEqual([705, 250])
  })

  it('geoPath.centroid(...) of a single-ring polygon', () => {
    expect(testCentroid(equirectangular, { type: 'Polygon', coordinates: [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]] })).toEqual([982.5, 247.5])
  })

  it('geoPath.centroid(...) of a zero-area polygon', () => {
    expect(testCentroid(equirectangular, { type: 'Polygon', coordinates: [[[1, 0], [2, 0], [3, 0], [1, 0]]] })).toEqual([490, 250])
  })

  it('geoPath.centroid(...) of a polygon with two rings, one with zero area', () => {
    expect(testCentroid(equirectangular, { type: 'Polygon', coordinates: [
      [[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]],
      [[100.1, 0], [100.2, 0], [100.3, 0], [100.1, 0]
    ]] })).toEqual([982.5, 247.5])
  })

  it('geoPath.centroid(...) of a polygon with clockwise exterior and anticlockwise interior', () => {
    assertInDelta(testCentroid(equirectangular, {
      type: 'Polygon',
      coordinates: [
        [[-2, -2], [2, -2], [2, 2], [-2, 2], [-2, -2]].reverse(),
        [[0, -1], [1, -1], [1, 1], [0, 1], [0, -1]]
      ]
    }), [479.642857, 250], 1e-6)
  })

  it('geoPath.centroid(...) of an empty multipolygon', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPolygon', coordinates: [] }).every(isNaN)).toBe(true)
  })

  it('geoPath.centroid(...) of a singleton multipolygon', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPolygon', coordinates: [[[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]]] })).toEqual([982.5, 247.5])
  })

  it('geoPath.centroid(...) of a multipolygon with two polygons', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPolygon', coordinates: [
      [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]],
      [[[0, 0], [1, 0], [1, -1], [0, -1], [0, 0]]]
    ] })).toEqual([732.5, 250])
  })

  it('geoPath.centroid(...) of a multipolygon with two polygons, one zero area', () => {
    expect(testCentroid(equirectangular, { type: 'MultiPolygon', coordinates: [
      [[[100, 0], [100, 1], [101, 1], [101, 0], [100, 0]]],
      [[[0, 0], [1, 0], [2, 0], [0, 0]]]
    ] })).toEqual([982.5, 247.5])
  })

  it('geoPath.centroid(...) of a geometry collection with a single point', () => {
    expect(testCentroid(equirectangular, { type: 'GeometryCollection', geometries: [{ type: 'Point', coordinates: [0, 0] }] })).toEqual([480, 250])
  })

  it('geoPath.centroid(...) of a geometry collection with a point and a linestring', () => {
    expect(testCentroid(equirectangular, { type: 'GeometryCollection', geometries: [
      { type: 'LineString', coordinates: [[179, 0], [180, 0]] },
      { type: 'Point', coordinates: [0, 0] }
    ] })).toEqual([1377.5, 250])
  })

  it('geoPath.centroid(...) of a geometry collection with a point, linestring and polygon', () => {
    expect(testCentroid(equirectangular, { type: 'GeometryCollection', geometries: [
      { type: 'Polygon', coordinates: [[[-180, 0], [-180, 1], [-179, 1], [-179, 0], [-180, 0]]] },
      { type: 'LineString', coordinates: [[179, 0], [180, 0]] },
      { type: 'Point', coordinates: [0, 0] }
    ] })).toEqual([-417.5, 247.5])
  })

  it('geoPath.centroid(...) of a feature collection with a point', () => {
    expect(testCentroid(equirectangular, { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }] })).toEqual([480, 250])
  })

  it('geoPath.centroid(...) of a feature collection with a point and a line string', () => {
    expect(testCentroid(equirectangular, { type: 'FeatureCollection', features: [
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[179, 0], [180, 0]] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }
    ] })).toEqual([1377.5, 250])
  })

  it('geoPath.centroid(...) of a feature collection with a point, line string and polygon', () => {
    expect(testCentroid(equirectangular, { type: 'FeatureCollection', features: [
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-180, 0], [-180, 1], [-179, 1], [-179, 0], [-180, 0]]] } },
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[179, 0], [180, 0]] } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }
    ] })).toEqual([-417.5, 247.5])
  })

  it('geoPath.centroid(...) of a sphere', () => {
    expect(testCentroid(equirectangular, { type: 'Sphere' })).toEqual([480, 250])
  })
})
