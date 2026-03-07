import { abs, atan2, cos, epsilon, pi, sign, sin, sqrt } from '../math.ts'
import { conicProjection } from './conic.ts'
import { equirectangularRaw } from './equirectangular.ts'

export function conicEquidistantRaw(y0: number, y1: number): any {
  const cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : (cy0 - cos(y1)) / (y1 - y0),
      g = cy0 / n + y0

  if (abs(n) < epsilon) return equirectangularRaw

  function project(x: number, y: number): number[] {
    const gy = g - y, nx = n * x
    return [gy * sin(nx), g - gy * cos(nx)]
  }

  project.invert = function (x: number, y: number): number[] {
    const gy = g - y
    let l = atan2(x, abs(gy)) * sign(gy)
    if (gy * n < 0)
      l -= pi * sign(x) * sign(gy)
    return [l / n, g - sign(n) * sqrt(x * x + gy * gy)]
  }

  return project
}

export default function geoConicEquidistant(): any {
  return conicProjection(conicEquidistantRaw)
      .scale(131.154)
      .center([0, 13.9389])
}
