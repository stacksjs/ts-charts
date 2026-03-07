import { degrees, pi, radians } from '../math.ts'
import { projectionMutator } from './index.ts'

export function conicProjection(projectAt: any): any {
  let phi0 = 0,
      phi1 = pi / 3
  const m = projectionMutator(projectAt),
      p = m(phi0, phi1)

  p.parallels = function (_?: number[]): any {
    return arguments.length ? m(phi0 = (_![0]) * radians, phi1 = (_![1]) * radians) : [phi0 * degrees, phi1 * degrees]
  }

  return p
}
