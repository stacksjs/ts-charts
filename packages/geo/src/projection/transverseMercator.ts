import { atan, exp, halfPi, log, tan } from '../math.ts'
import { mercatorProjection } from './mercator.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export function transverseMercatorRaw(lambda: number, phi: number): number[] {
  return [log(tan((halfPi + phi) / 2)), -lambda]
}

;
(transverseMercatorRaw as GeoRawProjection).invert = function (x: number, y: number): number[] {
  return [-y, 2 * atan(exp(x)) - halfPi]
}

export default function geoTransverseMercator(): GeoProjection {
  const m = mercatorProjection(transverseMercatorRaw as GeoRawProjection),
      center = m.center,
      rotate = m.rotate

  m.center = function (_?: number[]): GeoProjection | number[] {
    return arguments.length ? center([-_![1], _![0]]) : (_ = center() as number[], [_[1], -_[0]])
  }

  m.rotate = function (_?: number[]): GeoProjection | number[] {
    return arguments.length ? rotate([_![0], _![1], _!.length > 2 ? _![2] + 90 : 90]) : (_ = rotate() as number[], [_[0], _[1], _[2] - 90])
  }

  return rotate([0, 0, 90])
      .scale(159.155) as GeoProjection
}
