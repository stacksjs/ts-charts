import projection from './index.ts'
import { abs, asin, cos, epsilon2, sin, sqrt } from '../math.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

const A1 = 1.340264,
    A2 = -0.081106,
    A3 = 0.000893,
    A4 = 0.003796,
    M = sqrt(3) / 2,
    iterations = 12

export function equalEarthRaw(lambda: number, phi: number): number[] {
  const l = asin(M * sin(phi)), l2 = l * l, l6 = l2 * l2 * l2
  return [
    lambda * cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
  ]
}

;(equalEarthRaw as GeoRawProjection).invert = function (x: number, y: number): number[] {
  let l = y, l2 = l * l, l6 = l2 * l2 * l2
  for (let i = 0, delta: number, fy: number, fpy: number; i < iterations; ++i) {
    fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y
    fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)
    l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2
    if (abs(delta) < epsilon2) break
  }
  return [
    M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos(l),
    asin(sin(l) / M)
  ]
}

export default function geoEqualEarth(): GeoProjection {
  return projection(equalEarthRaw as GeoRawProjection)
      .scale(177.158)
}
