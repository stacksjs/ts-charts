import { describe, it, expect } from 'bun:test'
import { geoStream } from '../src/index.ts'
import type { GeoStream, GeoObject } from '../src/types.ts'

describe('geoStream', () => {
  it('geoStream(object) ignores unknown types', () => {
    geoStream({ type: 'Unknown' }, {} as GeoStream)
    geoStream({ type: 'Feature', geometry: { type: 'Unknown' } }, {} as GeoStream)
    geoStream({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Unknown' } }] }, {} as GeoStream)
    geoStream({ type: 'GeometryCollection', geometries: [{ type: 'Unknown' }] }, {} as GeoStream)
  })

  it('geoStream(object) ignores null geometries', () => {
    geoStream(null as any, {} as GeoStream)
    geoStream({ type: 'Feature', geometry: null }, {} as GeoStream)
    geoStream({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: null }] }, {} as GeoStream)
    geoStream({ type: 'GeometryCollection', geometries: [null as unknown as GeoObject] }, {} as GeoStream)
  })

  it('geoStream(object) returns void', () => {
    expect(geoStream({ type: 'Point', coordinates: [1, 2] }, { point: function () { return true } } as unknown as GeoStream)).toBeUndefined()
  })

  it('geoStream(object) allows empty multi-geometries', () => {
    geoStream({ type: 'MultiPoint', coordinates: [] }, {} as GeoStream)
    geoStream({ type: 'MultiLineString', coordinates: [] }, {} as GeoStream)
    geoStream({ type: 'MultiPolygon', coordinates: [] }, {} as GeoStream)
  })

  it('geoStream(Sphere) calls sphere', () => {
    let calls = 0
    geoStream({ type: 'Sphere' }, {
      sphere: function () {
        ++calls
      }
    } as unknown as GeoStream)
    expect(calls).toBe(1)
  })

  it('geoStream(Point) calls point', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'Point', coordinates: [1, 2, 3] }, {
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        ++calls
      }
    } as unknown as GeoStream)
    expect(calls).toBe(1)
  })

  it('geoStream(MultiPoint) calls point multiple times', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'MultiPoint', coordinates: [[1, 2, 3], [4, 5, 6]] }, {
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        ++calls
      }
    } as unknown as GeoStream)
    expect(calls).toBe(2)
  })

  it('geoStream(LineString) calls lineStart, point, lineEnd', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'LineString', coordinates: [[1, 2, 3], [4, 5, 6]] }, {
      lineStart: function () {
        expect(++calls).toBe(1)
      },
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        ++calls
      },
      lineEnd: function () {
        expect(++calls).toBe(4)
      }
    } as unknown as GeoStream)
    expect(calls).toBe(4)
  })

  it('geoStream(Polygon) calls polygonStart, lineStart, point, lineEnd, polygonEnd', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'Polygon', coordinates: [[[1, 2, 3], [4, 5, 6], [1, 2, 3]], [[7, 8, 9], [10, 11, 12], [7, 8, 9]]] }, {
      polygonStart: function () {
        expect(++calls === 1).toBe(true)
      },
      lineStart: function () {
        expect(++calls === 2 || calls === 6).toBe(true)
      },
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        expect(3 <= ++calls && calls <= 4 || 7 <= calls && calls <= 8).toBe(true)
      },
      lineEnd: function () {
        expect(++calls === 5 || calls === 9).toBe(true)
      },
      polygonEnd: function () {
        expect(++calls === 10).toBe(true)
      }
    } as unknown as GeoStream)
    expect(calls).toBe(10)
  })

  it('geoStream(Feature) streams the geometry', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2, 3] } }, {
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        expect(++calls).toBe(1)
      }
    } as unknown as GeoStream)
    expect(calls).toBe(1)
  })

  it('geoStream(FeatureCollection) streams all features', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2, 3] } }] }, {
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        expect(++calls).toBe(1)
      }
    } as unknown as GeoStream)
    expect(calls).toBe(1)
  })

  it('geoStream(GeometryCollection) streams all geometries', () => {
    let calls = 0
    let coordinates = 0
    geoStream({ type: 'GeometryCollection', geometries: [{ type: 'Point', coordinates: [1, 2, 3] }] }, {
      point: function (x: number, y: number, z: number) {
        expect(x).toBe(++coordinates)
        expect(y).toBe(++coordinates)
        expect(z).toBe(++coordinates)
        expect(++calls).toBe(1)
      }
    } as unknown as GeoStream)
    expect(calls).toBe(1)
  })
})
