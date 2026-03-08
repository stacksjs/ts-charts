import { atan, cos, sin } from '../math.ts'
import { azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export function gnomonicRaw(x: number, y: number): number[] {
  const cy = cos(y), k = cos(x) * cy
  return [cy * sin(x) / k, sin(y) / k]
}

;(gnomonicRaw as GeoRawProjection).invert = azimuthalInvert(atan)

export default function geoGnomonic(): GeoProjection {
  return projection(gnomonicRaw as GeoRawProjection)
      .scale(144.049)
      .clipAngle(60)
}
