import { atan, cos, sin } from '../math.ts'
import { azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'

export function gnomonicRaw(x: number, y: number): number[] {
  const cy = cos(y), k = cos(x) * cy
  return [cy * sin(x) / k, sin(y) / k]
}

(gnomonicRaw as any).invert = azimuthalInvert(atan)

export default function geoGnomonic(): any {
  return projection(gnomonicRaw)
      .scale(144.049)
      .clipAngle(60)
}
