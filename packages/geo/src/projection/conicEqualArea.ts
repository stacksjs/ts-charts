import { abs, asin, atan2, cos, epsilon, pi, sign, sin, sqrt } from '../math.ts'
import { conicProjection } from './conic.ts'
import { cylindricalEqualAreaRaw } from './cylindricalEqualArea.ts'
import type { GeoRawProjection, GeoConicProjection } from '../types.ts'

export function conicEqualAreaRaw(y0: number, y1: number): GeoRawProjection {
  const sy0 = sin(y0), n = (sy0 + sin(y1)) / 2

  // Are the parallels symmetrical around the Equator?
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y0)

  const c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n

  function project(x: number, y: number): number[] {
    const r = sqrt(c - 2 * n * sin(y)) / n
    return [r * sin(x *= n), r0 - r * cos(x)]
  }

  project.invert = function (x: number, y: number): number[] {
    const r0y = r0 - y,
        l = atan2(x, abs(r0y)) * sign(r0y)
    if (r0y * n < 0)
      return [(l - pi * sign(x) * sign(r0y)) / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))]
    return [l / n, asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))]
  }

  return project
}

export default function geoConicEqualArea(): GeoConicProjection {
  return conicProjection(conicEqualAreaRaw)
      .scale(155.424)
      .center([0, 33.6442])
}
