import { atan, cos, sin } from '../math.ts'
import { azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export function stereographicRaw(x: number, y: number): number[] {
  const cy = cos(y), k = 1 + cos(x) * cy
  return [cy * sin(x) / k, sin(y) / k]
}

;(stereographicRaw as GeoRawProjection).invert = azimuthalInvert(function (z: number): number {
  return 2 * atan(z)
})

export default function geoStereographic(): GeoProjection {
  return projection(stereographicRaw as GeoRawProjection)
      .scale(250)
      .clipAngle(142)
}
