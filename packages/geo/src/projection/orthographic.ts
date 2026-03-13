import { asin, cos, epsilon, sin } from '../math.ts'
import { azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export function orthographicRaw(x: number, y: number): number[] {
  return [cos(y) * sin(x), sin(y)]
}

// eslint-disable-next-line pickier/no-unused-vars, max-statements-per-line
;(orthographicRaw as GeoRawProjection).invert = azimuthalInvert(asin)

export default function geoOrthographic(): GeoProjection {
  return projection(orthographicRaw as GeoRawProjection)
      .scale(249.5)
      .clipAngle(90 + epsilon)
}
