import { describe, it, expect } from 'bun:test'
import { geoInterpolate } from '../src/index.ts'

function assertInDelta(actual: any, expected: any, delta: number) {
  if (Array.isArray(expected)) {
    for (let i = 0; i < expected.length; i++) {
      assertInDelta(actual[i], expected[i], delta)
    }
  } else {
    expect(Math.abs(actual - expected)).toBeLessThan(delta)
  }
}

describe('geoInterpolate', () => {
  it('geoInterpolate(a, a) returns a', () => {
    expect(geoInterpolate([140.63289, -29.95101], [140.63289, -29.95101])(0.5)).toEqual([140.63289, -29.95101])
  })

  it('geoInterpolate(a, b) returns the expected values when a and b lie on the equator', () => {
    assertInDelta(geoInterpolate([10, 0], [20, 0])(0.5), [15, 0], 1e-6)
  })

  it('geoInterpolate(a, b) returns the expected values when a and b lie on a meridian', () => {
    assertInDelta(geoInterpolate([10, -20], [10, 40])(0.5), [10, 10], 1e-6)
  })
})
