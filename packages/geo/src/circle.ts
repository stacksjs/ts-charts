import { cartesian, cartesianNormalizeInPlace, spherical } from './cartesian.ts'
import constant from './constant.ts'
import { acos, cos, degrees, epsilon, radians, sin, tau } from './math.ts'
import { rotateRadians } from './rotation.ts'

export function circleStream(stream: any, radius: number, delta: number, direction: number, t0: number | null, t1: number | null): void {
  if (!delta) return
  const cosRadius = cos(radius)
  const sinRadius = sin(radius)
  const step = direction * delta
  if (t0 == null) {
    t0 = radius + direction * tau
    t1 = radius - step / 2
  } else {
    t0 = circleRadius(cosRadius, t0 as any)
    t1 = circleRadius(cosRadius, t1 as any)
    if (direction > 0 ? t0 < t1! : t0 > t1!) t0 += direction * tau
  }
  for (let point: number[], t = t0; direction > 0 ? t > t1! : t < t1!; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)])
    stream.point(point[0], point[1])
  }
}

function circleRadius(cosRadius: number, point: number[]): number {
  point = cartesian(point), point[0] -= cosRadius
  cartesianNormalizeInPlace(point)
  const radius = acos(-point[1])
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau
}

export default function geoCircle(): any {
  let center: any = constant([0, 0]),
      radius: any = constant(90),
      precision: any = constant(2),
      ring: any,
      rotate: any,
      stream: any = { point: point }

  function point(x: number, y: number): void {
    const p = rotate(x, y)
    ring.push(p)
    p[0] *= degrees, p[1] *= degrees
  }

  function circle(this: any): any {
    const c = center.apply(this, arguments),
        r = radius.apply(this, arguments) * radians,
        p = precision.apply(this, arguments) * radians
    ring = []
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert
    circleStream(stream, r, p, 1, null, null)
    const result = { type: 'Polygon', coordinates: [ring] }
    ring = rotate = null
    return result
  }

  circle.center = function (_: any): any {
    return arguments.length ? (center = typeof _ === 'function' ? _ : constant([+_[0], +_[1]]), circle) : center
  }

  circle.radius = function (_: any): any {
    return arguments.length ? (radius = typeof _ === 'function' ? _ : constant(+_), circle) : radius
  }

  circle.precision = function (_: any): any {
    return arguments.length ? (precision = typeof _ === 'function' ? _ : constant(+_), circle) : precision
  }

  return circle
}
