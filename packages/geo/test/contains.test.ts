import { describe, it, expect } from 'bun:test'
import { geoCircle, geoContains, geoInterpolate } from '../src/index.ts'

describe('geoContains', () => {
  it('a sphere contains any point', () => {
    expect(geoContains({ type: 'Sphere' }, [0, 0])).toBe(true)
  })

  it('a point contains itself (and not some other point)', () => {
    expect(geoContains({ type: 'Point', coordinates: [0, 0] }, [0, 0])).toBe(true)
    expect(geoContains({ type: 'Point', coordinates: [1, 2] }, [1, 2])).toBe(true)
    expect(geoContains({ type: 'Point', coordinates: [0, 0] }, [0, 1])).toBe(false)
    expect(geoContains({ type: 'Point', coordinates: [1, 1] }, [1, 0])).toBe(false)
  })

  it('a MultiPoint contains any of its points', () => {
    expect(geoContains({ type: 'MultiPoint', coordinates: [[0, 0], [1, 2]] }, [0, 0])).toBe(true)
    expect(geoContains({ type: 'MultiPoint', coordinates: [[0, 0], [1, 2]] }, [1, 2])).toBe(true)
    expect(geoContains({ type: 'MultiPoint', coordinates: [[0, 0], [1, 2]] }, [1, 3])).toBe(false)
  })

  it('a LineString contains any point on the Great Circle path', () => {
    expect(geoContains({ type: 'LineString', coordinates: [[0, 0], [1, 2]] }, [0, 0])).toBe(true)
    expect(geoContains({ type: 'LineString', coordinates: [[0, 0], [1, 2]] }, [1, 2])).toBe(true)
    expect(geoContains({ type: 'LineString', coordinates: [[0, 0], [1, 2]] }, geoInterpolate([0, 0], [1, 2])(0.3))).toBe(true)
    expect(geoContains({ type: 'LineString', coordinates: [[0, 0], [1, 2]] }, geoInterpolate([0, 0], [1, 2])(1.3))).toBe(false)
    expect(geoContains({ type: 'LineString', coordinates: [[0, 0], [1, 2]] }, geoInterpolate([0, 0], [1, 2])(-0.3))).toBe(false)
  })

  it('a LineString with 2+ points contains those points', () => {
    const points: number[][] = [[0, 0], [1, 2], [3, 4], [5, 6]]
    const feature = { type: 'LineString', coordinates: points }
    points.forEach(point => {
      expect(geoContains(feature, point)).toBe(true)
    })
  })

  it('a MultiLineString contains any point on one of its components', () => {
    expect(geoContains({ type: 'MultiLineString', coordinates: [[[0, 0], [1, 2]], [[2, 3], [4, 5]]] }, [2, 3])).toBe(true)
    expect(geoContains({ type: 'MultiLineString', coordinates: [[[0, 0], [1, 2]], [[2, 3], [4, 5]]] }, [5, 6])).toBe(false)
  })

  it('a Polygon contains a point', () => {
    const polygon = geoCircle().radius(60)()
    expect(geoContains(polygon, [1, 1])).toBe(true)
    expect(geoContains(polygon, [-180, 0])).toBe(false)
  })

  it('a Polygon with a hole does not contain a point', () => {
    const outer = (geoCircle().radius(60)().coordinates as number[][][])[0]
    const inner = (geoCircle().radius(3)().coordinates as number[][][])[0]
    const polygon = { type: 'Polygon' as const, coordinates: [outer, inner] as number[][][] }
    expect(geoContains(polygon, [1, 1])).toBe(false)
    expect(geoContains(polygon, [5, 0])).toBe(true)
    expect(geoContains(polygon, [65, 0])).toBe(false)
  })

  it('a MultiPolygon contains a point', () => {
    const p1 = geoCircle().radius(6)().coordinates as number[][][]
    const p2 = geoCircle().radius(6).center([90, 0])().coordinates as number[][][]
    const polygon = { type: 'MultiPolygon' as const, coordinates: [p1, p2] as number[][][][] }
    expect(geoContains(polygon, [1, 0])).toBe(true)
    expect(geoContains(polygon, [90, 1])).toBe(true)
    expect(geoContains(polygon, [90, 45])).toBe(false)
  })

  it('a GeometryCollection contains a point', () => {
    const collection = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'GeometryCollection', geometries: [{ type: 'LineString', coordinates: [[-45, 0], [0, 0]] }] },
        { type: 'LineString', coordinates: [[0, 0], [45, 0]] }
      ]
    }
    expect(geoContains(collection, [-45, 0])).toBe(true)
    expect(geoContains(collection, [45, 0])).toBe(true)
    expect(geoContains(collection, [12, 25])).toBe(false)
  })

  it('a Feature contains a point', () => {
    const feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[0, 0], [45, 0]] }
    }
    expect(geoContains(feature, [45, 0])).toBe(true)
    expect(geoContains(feature, [12, 25])).toBe(false)
  })

  it('a FeatureCollection contains a point', () => {
    const feature1 = { type: 'Feature' as const, geometry: { type: 'LineString', coordinates: [[0, 0], [45, 0]] } }
    const feature2 = { type: 'Feature' as const, geometry: { type: 'LineString', coordinates: [[-45, 0], [0, 0]] } }
    const featureCollection = { type: 'FeatureCollection', features: [feature1, feature2] }
    expect(geoContains(featureCollection, [45, 0])).toBe(true)
    expect(geoContains(featureCollection, [-45, 0])).toBe(true)
    expect(geoContains(featureCollection, [12, 25])).toBe(false)
  })

  it('null contains nothing', () => {
    expect(geoContains(null as any, [0, 0])).toBe(false)
  })
})
