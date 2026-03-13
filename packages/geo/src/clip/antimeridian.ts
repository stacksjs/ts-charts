import clip from './index.ts'
import { abs, atan, cos, epsilon, halfPi, pi, sin } from '../math.ts'
import type { GeoStream, GeoStreamFactory, ClipLine } from '../types.ts'

export default clip(
  function (): boolean { return true },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
) as GeoStreamFactory

// Takes a line and cuts into visible segments. Return values: 0 - there were
// intersections or the line was empty; 1 - no intersections; 2 - there were
// intersections, and the first and last segments should be rejoined.
function clipAntimeridianLine(stream: GeoStream): ClipLine {
  let lambda0 = NaN,
      phi0 = NaN,
      sign0 = NaN,
      clean: number

  return {
    lineStart: function (): void {
      stream.lineStart()
      clean = 1
    },
    point: function (lambda1: number, phi1: number): void {
      const sign1 = lambda1 > 0 ? pi : -pi,
          delta = abs(lambda1 - lambda0)
      if (abs(delta - pi) < epsilon) { // line crosses a pole
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi)
        stream.point(sign0, phi0)
        stream.lineEnd()
        stream.lineStart()
        stream.point(sign1, phi0)
        stream.point(lambda1, phi0)
        clean = 0
      }
      else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
        if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon
        if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1)
        stream.point(sign0, phi0)
        stream.lineEnd()
        stream.lineStart()
        stream.point(sign1, phi0)
        clean = 0
      }
      stream.point(lambda0 = lambda1, phi0 = phi1)
      sign0 = sign1
    },
    lineEnd: function (): void {
      stream.lineEnd()
      lambda0 = phi0 = NaN
    },
    clean: function (): number {
      return 2 - clean // if intersections, rejoin first and last segments
    },
    polygonStart: function (): void { stream.polygonStart() },
    polygonEnd: function (): void { stream.polygonEnd() }
  }
}

function clipAntimeridianIntersect(lambda0: number, phi0: number, lambda1: number, phi1: number): number {
  let cosPhi0: number,
      cosPhi1: number
  const sinLambda0Lambda1 = sin(lambda0 - lambda1)
  return abs(sinLambda0Lambda1) > epsilon
      ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
          - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
      : (phi0 + phi1) / 2
}

function clipAntimeridianInterpolate(from: number[] | null, to: number[] | null, direction: number, stream: GeoStream): void {
  let phi: number
  if (from == null) {
    phi = direction * halfPi
    stream.point(-pi, phi)
    stream.point(0, phi)
    stream.point(pi, phi)
    stream.point(pi, 0)
    stream.point(pi, -phi)
    stream.point(0, -phi)
    stream.point(-pi, -phi)
    stream.point(-pi, 0)
    stream.point(-pi, phi)
  }
  else if (abs(from[0] - to![0]) > epsilon) {
    const lambda = from[0] < to![0] ? pi : -pi
    phi = direction * lambda / 2
    stream.point(-lambda, phi)
    stream.point(0, phi)
    stream.point(lambda, phi)
  }
  else {
    stream.point(to![0], to![1])
  }
}
