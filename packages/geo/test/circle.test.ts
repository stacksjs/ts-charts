import { describe, it, expect } from 'bun:test'
import { geoCircle } from '../src/index.ts'

function assertInDelta(actual: any, expected: any, delta: number) {
  if (Array.isArray(expected)) {
    expect(actual.length).toBe(expected.length)
    for (let i = 0; i < expected.length; i++) {
      assertInDelta(actual[i], expected[i], delta)
    }
  } else {
    expect(Math.abs(actual - expected)).toBeLessThan(delta)
  }
}

function range(start: number, stop: number, step: number) {
  const result = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) result.push(i)
  return result
}

describe('geoCircle', () => {
  it('circle generates a Polygon', () => {
    const o = geoCircle()()
    expect(o.type).toBe('Polygon')
  })

  it('circle.center([0, 90])', () => {
    const o = geoCircle().center([0, 90])()
    expect(o.type).toBe('Polygon')
    const expected = [range(360, -1, -2).map(function (x: number) { return [x >= 180 ? x - 360 : x, 0] })]
    assertInDelta(o.coordinates, expected, 1e-6)
  })

  it('circle.center([45, 45])', () => {
    const o = geoCircle().center([45, 45]).radius(0)()
    expect(o.type).toBe('Polygon')
    assertInDelta(o.coordinates[0][0], [45, 45], 1e-6)
  })

  it('circle: first and last points are coincident', () => {
    const o = geoCircle().center([0, 0]).radius(0.02).precision(45)()
    assertInDelta(o.coordinates[0][0], o.coordinates[0].pop(), 1e-6)
  })
})
