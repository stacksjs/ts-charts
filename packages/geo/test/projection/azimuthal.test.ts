import { describe, it, expect } from 'bun:test'
import { geoAzimuthalEqualArea, geoAzimuthalEquidistant } from '../../src/index.ts'

describe('azimuthal', () => {
  it('azimuthal projections don\'t crash on the antipode', () => {
    for (const p of [
      geoAzimuthalEqualArea()([180, 0]),
      geoAzimuthalEqualArea()([-180, 0]),
      geoAzimuthalEquidistant()([180, 0])
    ]) {
      expect(Math.abs(p[0]) < Infinity).toBe(true)
      expect(Math.abs(p[1]) < Infinity).toBe(true)
    }
  })
})
