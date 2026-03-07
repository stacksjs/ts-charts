import { asin, cos, sin } from '../math.ts'

export function cylindricalEqualAreaRaw(phi0: number): any {
  const cosPhi0 = cos(phi0)

  function forward(lambda: number, phi: number): number[] {
    return [lambda * cosPhi0, sin(phi) / cosPhi0]
  }

  forward.invert = function (x: number, y: number): number[] {
    return [x / cosPhi0, asin(y * cosPhi0)]
  }

  return forward
}
