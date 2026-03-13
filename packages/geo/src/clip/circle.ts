import { cartesian, cartesianAddInPlace, cartesianCross, cartesianDot, cartesianScale, spherical } from '../cartesian.ts'
import { circleStream } from '../circle.ts'
import { abs, cos, epsilon, pi, radians, sqrt } from '../math.ts'
import pointEqual from '../pointEqual.ts'
import clip from './index.ts'
import type { GeoStream, GeoStreamFactory, ClipLine } from '../types.ts'

export default function clipCircle(radius: number): GeoStreamFactory {
  const cr = cos(radius),
      delta = 2 * radians,
      smallRadius = cr > 0,
      notHemisphere = abs(cr) > epsilon

  function interpolate(from: number[] | null, to: number[] | null, direction: number, stream: GeoStream): void {
    circleStream(stream, radius, delta, direction, from as number[] | null, to as number[] | null)
  }

  function visible(lambda: number, phi: number): boolean {
    return cos(lambda) * cos(phi) > cr
  }

  function clipLine(stream: GeoStream): ClipLine {
    let point0: number[] | null,
        c0: number,
        v0: boolean,
        v00: boolean,
        clean: number
    return {
      lineStart: function (): void {
        v00 = v0 = false
        clean = 1
      },
      point: function (lambda: number, phi: number): void {
        const point1: number[] = [lambda, phi]
        let point2: number[] | null | undefined
        const v = visible(lambda, phi),
            c = smallRadius
              ? v ? 0 : code(lambda, phi)
              : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0
        if (!point0 && (v00 = v0 = v)) stream.lineStart()
        if (v !== v0) {
          point2 = intersect(point0!, point1) as number[] | undefined
          if (!point2 || pointEqual(point0!, point2) || pointEqual(point1, point2))
            point1[2] = 1
        }
        if (v !== v0) {
          clean = 0
          if (v) {
            stream.lineStart()
            point2 = intersect(point1, point0!) as number[] | undefined
            stream.point(point2![0], point2![1])
          }
          else {
            point2 = intersect(point0!, point1) as number[] | undefined
            stream.point(point2![0], point2![1], 2)
            stream.lineEnd()
          }
          point0 = point2!
        }
        else if (notHemisphere && point0 && smallRadius !== v) {
          let t: number[][] | undefined
          if (!(c & c0) && (t = intersect(point1, point0!, true) as number[][] | undefined)) {
            clean = 0
            if (smallRadius) {
              stream.lineStart()
              stream.point(t[0][0], t[0][1])
              stream.point(t[1][0], t[1][1])
              stream.lineEnd()
            }
            else {
              stream.point(t[1][0], t[1][1])
              stream.lineEnd()
              stream.lineStart()
              stream.point(t[0][0], t[0][1], 3)
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1])
        }
        point0 = point1, v0 = v, c0 = c
      },
      lineEnd: function (): void {
        if (v0) stream.lineEnd()
        point0 = null
      },
      clean: function (): number {
        return clean | ((v00 && v0) ? 2 : 0)
      },
      polygonStart: function (): void { stream.polygonStart() },
      polygonEnd: function (): void { stream.polygonEnd() }
    }
  }

  function intersect(a: number[], b: number[], two?: boolean): number[] | number[][] | undefined {
    const pa = cartesian(a),
        pb = cartesian(b)

    const n1 = [1, 0, 0],
        n2 = cartesianCross(pa, pb),
        n2n2 = cartesianDot(n2, n2),
        n1n2 = n2[0],
        determinant = n2n2 - n1n2 * n1n2

    if (!determinant) return !two ? a : undefined

    const c1 = cr * n2n2 / determinant,
        c2 = -cr * n1n2 / determinant,
        n1xn2 = cartesianCross(n1, n2),
        A = cartesianScale(n1, c1),
        B = cartesianScale(n2, c2)
    cartesianAddInPlace(A, B)

    const u = n1xn2,
        w = cartesianDot(A, u),
        uu = cartesianDot(u, u),
        t2 = w * w - uu * (cartesianDot(A, A) - 1)

    if (t2 < 0) return undefined

    const t = sqrt(t2)
    let q: number[] = cartesianScale(u, (-w - t) / uu)
    cartesianAddInPlace(q, A)
    q = spherical(q)

    if (!two) return q

    let lambda0 = a[0],
        lambda1 = b[0],
        phi0 = a[1],
        phi1 = b[1],
        z: number

    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z

    const deltaN = lambda1 - lambda0,
        polar = abs(deltaN - pi) < epsilon,
        meridian = polar || deltaN < epsilon

    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z

    if (meridian
        ? polar
          ? phi0 + phi1 > 0 !== q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
          : phi0 <= q[1] && q[1] <= phi1
        : deltaN > pi !== (lambda0 <= q[0] && q[0] <= lambda1)) {
      const q1 = cartesianScale(u, (-w + t) / uu)
      cartesianAddInPlace(q1, A)
      return [q, spherical(q1)]
    }
  }

  function code(lambda: number, phi: number): number {
    const r = smallRadius ? radius : pi - radius
    let c = 0
    if (lambda < -r) c |= 1
    else if (lambda > r) c |= 2
    if (phi < -r) c |= 4
    else if (phi > r) c |= 8
    return c
  }

  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi])
}
