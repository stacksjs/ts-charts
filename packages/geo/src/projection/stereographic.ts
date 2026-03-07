import { atan, cos, sin } from '../math.ts'
import { azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'

export function stereographicRaw(x: number, y: number): number[] {
  const cy = cos(y), k = 1 + cos(x) * cy
  return [cy * sin(x) / k, sin(y) / k]
}

(stereographicRaw as any).invert = azimuthalInvert(function (z: number): number {
  return 2 * atan(z)
})

export default function geoStereographic(): any {
  return projection(stereographicRaw)
      .scale(250)
      .clipAngle(142)
}
