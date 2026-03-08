import { cartesian } from '../cartesian.ts'
import { abs, asin, atan2, cos, epsilon, radians, sqrt } from '../math.ts'
import { transformer } from '../transform.ts'
import type { GeoStream, GeoStreamFactory, GeoRawProjection, GeoTransformInstance } from '../types.ts'

const maxDepth = 16
const cosMinDistance = cos(30 * radians)

export default function resampleProjection(project: GeoRawProjection, delta2: number): GeoStreamFactory {
  return +delta2 ? resample(project, delta2) : resampleNone(project)
}

function resampleNone(project: GeoRawProjection): GeoStreamFactory {
  return transformer({
    point: function (this: GeoTransformInstance, x: number, y: number): void {
      const p = project(x, y)
      this.stream.point(p[0], p[1])
    }
  })
}

function resample(project: GeoRawProjection, delta2: number): GeoStreamFactory {

  function resampleLineTo(x0: number, y0: number, lambda0: number, a0: number, b0: number, c0: number, x1: number, y1: number, lambda1: number, a1: number, b1: number, c1: number, depth: number, stream: GeoStream): void {
    const dx = x1 - x0,
        dy = y1 - y0,
        d2 = dx * dx + dy * dy
    if (d2 > 4 * delta2 && depth--) {
      let a = a0 + a1,
          b = b0 + b1,
          c = c0 + c1,
          m = sqrt(a * a + b * b + c * c),
          phi2 = asin(c /= m),
          lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
          p = project(lambda2, phi2),
          x2 = p[0],
          y2 = p[1],
          dx2 = x2 - x0,
          dy2 = y2 - y0,
          dz = dy * dx2 - dx * dy2
      if (dz * dz / d2 > delta2
          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3
          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream)
        stream.point(x2, y2)
        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream)
      }
    }
  }

  return function (stream: GeoStream): GeoStream {
    let lambda00: number, x00: number, y00: number, a00: number, b00: number, c00: number,
        lambda0: number, x0: number, y0: number, a0: number, b0: number, c0: number

    const resampleStream: GeoStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function (): void { stream.polygonStart(); resampleStream.lineStart = ringStart },
      polygonEnd: function (): void { stream.polygonEnd(); resampleStream.lineStart = lineStart }
    }

    function point(x: number, y: number): void {
      const p = project(x, y)
      stream.point(p[0], p[1])
    }

    function lineStart(): void {
      x0 = NaN
      resampleStream.point = linePoint
      stream.lineStart()
    }

    function linePoint(lambda: number, phi: number): void {
      const c = cartesian([lambda, phi]), p = project(lambda, phi)
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream)
      stream.point(x0, y0)
    }

    function lineEnd(): void {
      resampleStream.point = point
      stream.lineEnd()
    }

    function ringStart(): void {
      lineStart()
      resampleStream.point = ringPoint
      resampleStream.lineEnd = ringEnd
    }

    function ringPoint(lambda: number, phi: number): void {
      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0
      resampleStream.point = linePoint
    }

    function ringEnd(): void {
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream)
      resampleStream.lineEnd = lineEnd
      lineEnd()
    }

    return resampleStream
  }
}
