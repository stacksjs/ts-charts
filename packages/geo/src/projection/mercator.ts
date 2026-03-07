import { atan, exp, halfPi, log, pi, tan, tau } from '../math.ts'
import rotation from '../rotation.ts'
import projection from './index.ts'

export function mercatorRaw(lambda: number, phi: number): number[] {
  return [lambda, log(tan((halfPi + phi) / 2))]
}

(mercatorRaw as any).invert = function (x: number, y: number): number[] {
  return [x, 2 * atan(exp(y)) - halfPi]
}

export default function geoMercator(): any {
  return mercatorProjection(mercatorRaw)
      .scale(961 / tau)
}

export function mercatorProjection(project: any): any {
  const m = projection(project),
      center = m.center,
      scale = m.scale,
      translate = m.translate,
      clipExtent = m.clipExtent
  let x0: number | null = null, y0: number, x1: number, y1: number

  m.scale = function (_?: any): any {
    return arguments.length ? (scale(_), reclip()) : scale()
  }

  m.translate = function (_?: any): any {
    return arguments.length ? (translate(_), reclip()) : translate()
  }

  m.center = function (_?: any): any {
    return arguments.length ? (center(_), reclip()) : center()
  }

  m.clipExtent = function (_?: any): any {
    return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null as any : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]]
  }

  function reclip(): any {
    const k = pi * scale(),
        t = m(rotation(m.rotate()).invert([0, 0]))
    return clipExtent(x0 == null
        ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
        ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
        : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]])
  }

  return reclip()
}
