import { describe, it, expect } from 'bun:test'
import { geoDistance } from '../src/index.ts'

describe('geoDistance', () => {
  it('geoDistance(a, b) computes the great-arc distance in radians between the two points a and b', () => {
    expect(geoDistance([0, 0], [0, 0])).toBe(0)
    expect(Math.abs(geoDistance([118 + 24 / 60, 33 + 57 / 60], [73 + 47 / 60, 40 + 38 / 60]) - 3973 / 6371)).toBeLessThan(0.5)
  })

  it('geoDistance(a, b) correctly computes small distances', () => {
    expect(geoDistance([0, 0], [0, 1e-12]) > 0).toBe(true)
  })
})
