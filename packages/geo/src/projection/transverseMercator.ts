import { atan, exp, halfPi, log, tan } from '../math.ts'
import { mercatorProjection } from './mercator.ts'

export function transverseMercatorRaw(lambda: number, phi: number): number[] {
  return [log(tan((halfPi + phi) / 2)), -lambda]
}

(transverseMercatorRaw as any).invert = function (x: number, y: number): number[] {
  return [-y, 2 * atan(exp(x)) - halfPi]
}

export default function geoTransverseMercator(): any {
  const m = mercatorProjection(transverseMercatorRaw),
      center = m.center,
      rotate = m.rotate

  m.center = function (_?: any): any {
    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]])
  }

  m.rotate = function (_?: any): any {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90])
  }

  return m.rotate([0, 0, 90])
      .scale(159.155)
}
