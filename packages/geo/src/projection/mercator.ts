import { atan, exp, halfPi, log, pi, tan, tau } from '../math.ts'
import rotation from '../rotation.ts'
import projection from './index.ts'
import type { GeoRawProjection, GeoProjection } from '../types.ts'

export function mercatorRaw(lambda: number, phi: number): number[] {
  return [lambda, log(tan((halfPi + phi) / 2))]
}

;
(mercatorRaw as GeoRawProjection).invert = function (x: number, y: number): number[] {
  return [x, 2 * atan(exp(y)) - halfPi]
}

export default function geoMercator(): GeoProjection {
  return mercatorProjection(mercatorRaw as GeoRawProjection)
      .scale(961 / tau)
}

export function mercatorProjection(project: GeoRawProjection): GeoProjection {
  const m = projection(project) as GeoProjection,
      center = m.center,
      scale = m.scale,
      translate = m.translate,
      clipExtent = m.clipExtent
  let x0: number | null = null, y0: number, x1: number, y1: number

  m.scale = function (_?: number): any {
    return arguments.length ? (scale(_!), reclip()) : scale()
  }

  m.translate = function (_?: number[]): any {
    return arguments.length ? (translate(_!), reclip()) : translate()
  }

  m.center = function (_?: number[]): any {
    return arguments.length ? (center(_!), reclip()) : center()
  }

  m.clipExtent = function (_?: number[][] | null): any {
    return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null! : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]]
  }

  function reclip(): GeoProjection {
    const k = pi * (scale() as number),
        t = m(rotation(m.rotate() as number[]).invert([0, 0]))!
    return clipExtent(x0 == null
        ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === (mercatorRaw as GeoRawProjection)
        ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
        : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]) as GeoProjection
  }

  return reclip()
}
