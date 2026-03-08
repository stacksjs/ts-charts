import { describe, it, expect } from 'bun:test'
import { geoArea, geoCircle, geoGraticule } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function range(start: number, stop: number, step: number) {
  const result = []
  for (let i = start; i < stop; i += step) result.push(i)
  return result
}

function stripes(a: number, b: number) {
  return {
    type: 'Polygon',
    coordinates: [a, b].map(function (d, i) {
      const stripe = range(-180, 180, 0.1).map(function (x) { return [x, d] })
      stripe.push(stripe[0])
      return i ? stripe.reverse() : stripe
    })
  }
}

describe('geoArea', () => {
  it('area: Point', () => {
    expect(geoArea({ type: 'Point', coordinates: [0, 0] })).toBe(0)
  })

  it('area: MultiPoint', () => {
    expect(geoArea({ type: 'MultiPoint', coordinates: [[0, 1], [2, 3]] })).toBe(0)
  })

  it('area: LineString', () => {
    expect(geoArea({ type: 'LineString', coordinates: [[0, 1], [2, 3]] })).toBe(0)
  })

  it('area: MultiLineString', () => {
    expect(geoArea({ type: 'MultiLineString', coordinates: [[[0, 1], [2, 3]], [[4, 5], [6, 7]]] })).toBe(0)
  })

  it('area: Polygon - tiny', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[
      [-64.66070178517852, 18.33986913231323],
      [-64.66079715091509, 18.33994007490749],
      [-64.66074946804680, 18.33994007490749],
      [-64.66070178517852, 18.33986913231323]
    ]] }), 4.890516e-13, 1e-13)
  })

  it('area: Polygon - zero area', () => {
    expect(geoArea({
      type: 'Polygon',
      coordinates: [[
        [96.79142432523281, 5.262704519048153],
        [96.81065389253769, 5.272455576551362],
        [96.82988345984256, 5.272455576551362],
        [96.81065389253769, 5.272455576551362],
        [96.79142432523281, 5.262704519048153]
      ]]
    })).toBe(0)
  })

  it('area: Polygon - semilune', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[[0, 0], [0, 90], [90, 0], [0, 0]]] }), Math.PI / 2, 1e-6)
  })

  it('area: Polygon - lune', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[[0, 0], [0, 90], [90, 0], [0, -90], [0, 0]]] }), Math.PI, 1e-6)
  })

  it('area: Polygon - hemispheres North', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[[0, 0], [-90, 0], [180, 0], [90, 0], [0, 0]]] }), 2 * Math.PI, 1e-6)
  })

  it('area: Polygon - hemispheres South', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[[0, 0], [90, 0], [180, 0], [-90, 0], [0, 0]]] }), 2 * Math.PI, 1e-6)
  })

  it('area: Polygon - hemispheres East', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[[0, 0], [0, 90], [180, 0], [0, -90], [0, 0]]] }), 2 * Math.PI, 1e-6)
  })

  it('area: Polygon - hemispheres West', () => {
    assertInDelta(geoArea({ type: 'Polygon', coordinates: [[[0, 0], [0, -90], [180, 0], [0, 90], [0, 0]]] }), 2 * Math.PI, 1e-6)
  })

  it('area: Polygon - graticule outline sphere', () => {
    assertInDelta(geoArea(geoGraticule().extent([[-180, -90], [180, 90]]).outline()), 4 * Math.PI, 1e-5)
  })

  it('area: Polygon - graticule outline hemisphere', () => {
    assertInDelta(geoArea(geoGraticule().extent([[-180, 0], [180, 90]]).outline()), 2 * Math.PI, 1e-5)
  })

  it('area: Polygon - graticule outline semilune', () => {
    assertInDelta(geoArea(geoGraticule().extent([[0, 0], [90, 90]]).outline()), Math.PI / 2, 1e-5)
  })

  it('area: Polygon - circles hemisphere', () => {
    assertInDelta(geoArea(geoCircle().radius(90)()), 2 * Math.PI, 1e-5)
  })

  it('area: Polygon - circles 60 degrees', () => {
    assertInDelta(geoArea(geoCircle().radius(60).precision(0.1)()), Math.PI, 1e-5)
  })

  it('area: Polygon - circles 60 degrees North', () => {
    assertInDelta(geoArea(geoCircle().radius(60).precision(0.1).center([0, 90])()), Math.PI, 1e-5)
  })

  it('area: Polygon - circles 45 degrees', () => {
    assertInDelta(geoArea(geoCircle().radius(45).precision(0.1)()), Math.PI * (2 - Math.SQRT2), 1e-5)
  })

  it('area: Polygon - circles 45 degrees North', () => {
    assertInDelta(geoArea(geoCircle().radius(45).precision(0.1).center([0, 90])()), Math.PI * (2 - Math.SQRT2), 1e-5)
  })

  it('area: Polygon - circles 45 degrees South', () => {
    assertInDelta(geoArea(geoCircle().radius(45).precision(0.1).center([0, -90])()), Math.PI * (2 - Math.SQRT2), 1e-5)
  })

  it('area: Polygon - circles 135 degrees', () => {
    assertInDelta(geoArea(geoCircle().radius(135).precision(0.1)()), Math.PI * (2 + Math.SQRT2), 1e-5)
  })

  it('area: Polygon - circles 135 degrees North', () => {
    assertInDelta(geoArea(geoCircle().radius(135).precision(0.1).center([0, 90])()), Math.PI * (2 + Math.SQRT2), 1e-5)
  })

  it('area: Polygon - circles 135 degrees South', () => {
    assertInDelta(geoArea(geoCircle().radius(135).precision(0.1).center([0, -90])()), Math.PI * (2 + Math.SQRT2), 1e-5)
  })

  it('area: Polygon - circles tiny', () => {
    assertInDelta(geoArea(geoCircle().radius(1e-6).precision(0.1)()), 0, 1e-6)
  })

  it('area: Polygon - circles huge', () => {
    assertInDelta(geoArea(geoCircle().radius(180 - 1e-6).precision(0.1)()), 4 * Math.PI, 1e-6)
  })

  it('area: Polygon - circles 60 degrees with 45 degrees hole', () => {
    const circle = geoCircle().precision(0.1)
    assertInDelta(geoArea({
      type: 'Polygon',
      coordinates: [
        (circle.radius(60)().coordinates as number[][][])[0],
        (circle.radius(45)().coordinates as number[][][])[0].reverse()
      ]
    }), Math.PI * (Math.SQRT2 - 1), 1e-5)
  })

  it('area: Polygon - stripes 45, -45', () => {
    assertInDelta(geoArea(stripes(45, -45)), Math.PI * 2 * Math.SQRT2, 1e-5)
  })

  it('area: Polygon - stripes -45, 45', () => {
    assertInDelta(geoArea(stripes(-45, 45)), Math.PI * 2 * (2 - Math.SQRT2), 1e-5)
  })

  it('area: Polygon - stripes 45, 30', () => {
    assertInDelta(geoArea(stripes(45, 30)), Math.PI * (Math.SQRT2 - 1), 1e-5)
  })

  it('area: MultiPolygon two hemispheres', () => {
    expect(geoArea({ type: 'MultiPolygon', coordinates: [
      [[[0, 0], [-90, 0], [180, 0], [90, 0], [0, 0]]],
      [[[0, 0], [90, 0], [180, 0], [-90, 0], [0, 0]]]
    ] })).toBe(4 * Math.PI)
  })

  it('area: Sphere', () => {
    expect(geoArea({ type: 'Sphere' })).toBe(4 * Math.PI)
  })

  it('area: GeometryCollection', () => {
    expect(geoArea({ type: 'GeometryCollection', geometries: [{ type: 'Sphere' }] })).toBe(4 * Math.PI)
  })

  it('area: FeatureCollection', () => {
    expect(geoArea({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Sphere' } }] })).toBe(4 * Math.PI)
  })

  it('area: Feature', () => {
    expect(geoArea({ type: 'Feature', geometry: { type: 'Sphere' } })).toBe(4 * Math.PI)
  })
})
