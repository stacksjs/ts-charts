import { Adder } from '@ts-charts/array'
import { cartesian, cartesianCross, cartesianNormalizeInPlace } from './cartesian.ts'
import { abs, asin, atan2, cos, epsilon, epsilon2, halfPi, pi, quarterPi, sign, sin, tau } from './math.ts'

function longitude(point: number[]): number {
  return abs(point[0]) <= pi ? point[0] : sign(point[0]) * ((abs(point[0]) + pi) % tau - pi)
}

export default function polygonContains(polygon: number[][][], point: number[]): boolean {
  const lambda = longitude(point)
  let phi = point[1]
  const sinPhi = sin(phi)
  const normal = [sin(lambda), -cos(lambda), 0]
  let angle = 0,
      winding = 0

  const sum = new Adder()

  if (sinPhi === 1) phi = halfPi + epsilon
  else if (sinPhi === -1) phi = -halfPi - epsilon

  for (let i = 0, n = polygon.length; i < n; ++i) {
    let ring: number[][]
    let m: number
    if (!(m = (ring = polygon[i]).length)) continue
    let point0 = ring[m - 1],
        lambda0 = longitude(point0),
        phi0 = point0[1] / 2 + quarterPi,
        sinPhi0 = sin(phi0),
        cosPhi0 = cos(phi0)

    for (let j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      // eslint-disable-next-line pickier/no-unused-vars
      var point1 = ring[j],
          lambda1 = longitude(point1),
          phi1 = point1[1] / 2 + quarterPi,
          sinPhi1 = sin(phi1),
          cosPhi1 = cos(phi1),
          delta = lambda1 - lambda0,
          signDelta = delta >= 0 ? 1 : -1,
          absDelta = signDelta * delta,
          antimeridian = absDelta > pi,
          k = sinPhi0 * sinPhi1

      sum.add(atan2(k * signDelta * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)))
      angle += antimeridian ? delta + signDelta * tau : delta

      if ((antimeridian ? 1 : 0) ^ (lambda0 >= lambda ? 1 : 0) ^ (lambda1 >= lambda ? 1 : 0)) {
        const arc = cartesianCross(cartesian(point0), cartesian(point1))
        cartesianNormalizeInPlace(arc)
        const intersection = cartesianCross(normal, arc)
        cartesianNormalizeInPlace(intersection)
        const phiArc = (antimeridian !== (delta >= 0) ? -1 : 1) * asin(intersection[2])
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian !== (delta >= 0) ? 1 : -1
        }
      }
    }
  }

  return (((angle < -epsilon || angle < epsilon && +sum < -epsilon2) ? 1 : 0) ^ (winding & 1)) !== 0
}
