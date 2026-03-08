import { acos, sin } from '../math.ts'
import { azimuthalRaw, azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export const azimuthalEquidistantRaw: GeoRawProjection = azimuthalRaw(function (c: number): number {
  return (c = acos(c)) && c / sin(c)
})

azimuthalEquidistantRaw.invert = azimuthalInvert(function (z: number): number {
  return z
})

export default function geoAzimuthalEquidistant(): GeoProjection {
  return projection(azimuthalEquidistantRaw)
      .scale(79.4188)
      .clipAngle(180 - 1e-3)
}
