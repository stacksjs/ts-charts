import { asin, cos, epsilon, sin } from '../math.ts'
import { azimuthalInvert } from './azimuthal.ts'
import projection from './index.ts'

export function orthographicRaw(x: number, y: number): number[] {
  return [cos(y) * sin(x), sin(y)]
}

(orthographicRaw as any).invert = azimuthalInvert(asin)

export default function geoOrthographic(): any {
  return projection(orthographicRaw)
      .scale(249.5)
      .clipAngle(90 + epsilon)
}
