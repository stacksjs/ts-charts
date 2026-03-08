import { abs, atan, atan2, cos, epsilon, halfPi, log, pi, pow, sign, sin, sqrt, tan } from '../math.ts'
import { conicProjection } from './conic.ts'
import { mercatorRaw } from './mercator.ts'
import type { GeoRawProjection, GeoConicProjection } from '../types.ts'

function tany(y: number): number {
  return tan((halfPi + y) / 2)
}

export function conicConformalRaw(y0: number, y1: number): GeoRawProjection {
  const cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
      f = cy0 * pow(tany(y0), n) / n

  if (!n) return mercatorRaw as GeoRawProjection

  function project(x: number, y: number): number[] {
    if (f > 0) { if (y < -halfPi + epsilon) y = -halfPi + epsilon }
    else { if (y > halfPi - epsilon) y = halfPi - epsilon }
    const r = f / pow(tany(y), n)
    return [r * sin(n * x), f - r * cos(n * x)]
  }

  project.invert = function (x: number, y: number): number[] {
    const fy = f - y, r = sign(n) * sqrt(x * x + fy * fy)
    let l = atan2(x, abs(fy)) * sign(fy)
    if (fy * n < 0)
      l -= pi * sign(x) * sign(fy)
    return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi]
  }

  return project
}

export default function geoConicConformal(): GeoConicProjection {
  return conicProjection(conicConformalRaw)
      .scale(109.5)
      .parallels([30, 30])
}
