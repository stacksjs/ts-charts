import { degrees, pi, radians } from '../math.ts'
import { projectionMutator } from './index.ts'
import type { GeoRawProjection, GeoConicProjection } from '../types.ts'

export function conicProjection(projectAt: (y0: number, y1: number) => GeoRawProjection): GeoConicProjection {
  let phi0 = 0,
      phi1 = pi / 3
  // eslint-disable-next-line pickier/no-unused-vars
  const m = projectionMutator(projectAt as (...args: unknown[]) => GeoRawProjection),
      p = m(phi0, phi1) as unknown as GeoConicProjection

  p.parallels = function (_?: number[]): GeoConicProjection | number[] {
    return arguments.length ? m(phi0 = (_![0]) * radians, phi1 = (_![1]) * radians) as unknown as GeoConicProjection : [phi0 * degrees, phi1 * degrees]
  }

  return p
}
