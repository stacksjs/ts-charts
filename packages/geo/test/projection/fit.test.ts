import { describe, it, expect } from 'bun:test'
import {
  geoEquirectangular,
  geoMercator,
  geoProjection,
} from '../../src/index.ts'
import { assertInDelta } from '../helpers/asserts.ts'

describe('projection.fit', () => {
  it('projection.fitExtent(...) sphere equirectangular', () => {
    const projection = geoEquirectangular()
    projection.fitExtent([[50, 50], [950, 950]], { type: 'Sphere' })
    assertInDelta(projection.scale(), 900 / (2 * Math.PI), 1e-6)
    assertInDelta(projection.translate(), [500, 500], 1e-6)
  })

  it('projection.fitExtent(...) null geometries - Feature', () => {
    const projection = geoEquirectangular()
    projection.fitExtent([[50, 50], [950, 950]], { type: 'Feature', geometry: null })
    const s = projection.scale(), t = projection.translate()
    expect(!s).toBe(true)
    expect(isNaN(t[0])).toBe(true)
    expect(isNaN(t[1])).toBe(true)
  })

  it('projection.fitExtent(...) null geometries - MultiPoint', () => {
    const projection = geoEquirectangular()
    projection.fitExtent([[50, 50], [950, 950]], { type: 'MultiPoint', coordinates: [] })
    const s = projection.scale(), t = projection.translate()
    expect(!s).toBe(true)
    expect(isNaN(t[0])).toBe(true)
    expect(isNaN(t[1])).toBe(true)
  })

  it('projection.fitExtent(...) null geometries - MultiLineString', () => {
    const projection = geoEquirectangular()
    projection.fitExtent([[50, 50], [950, 950]], { type: 'MultiLineString', coordinates: [] })
    const s = projection.scale(), t = projection.translate()
    expect(!s).toBe(true)
    expect(isNaN(t[0])).toBe(true)
    expect(isNaN(t[1])).toBe(true)
  })

  it('projection.fitExtent(...) null geometries - MultiPolygon', () => {
    const projection = geoEquirectangular()
    projection.fitExtent([[50, 50], [950, 950]], { type: 'MultiPolygon', coordinates: [] })
    const s = projection.scale(), t = projection.translate()
    expect(!s).toBe(true)
    expect(isNaN(t[0])).toBe(true)
    expect(isNaN(t[1])).toBe(true)
  })

  it('projection.fitSize(...) ignore clipExtent - sphere equirectangular', () => {
    const p1 = geoEquirectangular().fitSize([1000, 1000], { type: 'Sphere' })
    const s1 = p1.scale()
    const t1 = p1.translate()
    const c1 = p1.clipExtent()
    const p2 = geoEquirectangular().clipExtent([[100, 200], [700, 600]]).fitSize([1000, 1000], { type: 'Sphere' })
    const s2 = p2.scale()
    const t2 = p2.translate()
    const c2 = p2.clipExtent()
    assertInDelta(s1, s2, 1e-6)
    assertInDelta(t1, t2, 1e-6)
    expect(c1).toBe(null)
    expect(c2).toEqual([[100, 200], [700, 600]])
  })

  it('projection.fitSize(...) resampling - box mercator', () => {
    const box = { type: 'Polygon', coordinates: [[[-135, 45], [-45, 45], [-45, -45], [-135, -45], [-135, 45]]] }
    const p1 = geoMercator().precision(0.1).fitSize([1000, 1000], box)
    const p2 = geoMercator().precision(0).fitSize([1000, 1000], box)
    const t1 = p1.translate()
    const t2 = p2.translate()
    expect(p1.precision()).toBe(0.1)
    expect(p2.precision()).toBe(0)
    assertInDelta(p1.scale(), 436.218018, 1e-6)
    assertInDelta(p2.scale(), 567.296328, 1e-6)
    assertInDelta(t1[0], 1185.209661, 1e-6)
    assertInDelta(t2[0], 1391.106989, 1e-6)
    assertInDelta(t1[1], 500, 1e-6)
    assertInDelta(t1[1], t2[1], 1e-6)
  })
})
