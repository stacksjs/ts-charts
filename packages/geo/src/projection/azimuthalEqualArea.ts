import { asin, sqrt } from '../math.ts'
import { azimuthalRaw, azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export const azimuthalEqualAreaRaw: GeoRawProjection = azimuthalRaw(function (cxcy: number): number {
  return sqrt(2 / (1 + cxcy))
})

azimuthalEqualAreaRaw.invert = azimuthalInvert(function (z: number): number {
  return 2 * asin(z / 2)
})

export default function geoAzimuthalEqualArea(): GeoProjection {
  return projection(azimuthalEqualAreaRaw)
      .scale(124.75)
      .clipAngle(180 - 1e-3)
}
