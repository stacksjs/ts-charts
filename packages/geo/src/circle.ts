import { cartesian, cartesianNormalizeInPlace, spherical } from './cartesian.ts'
import constant from './constant.ts'
import { acos, cos, degrees, epsilon, radians, sin, tau } from './math.ts'
import { rotateRadians } from './rotation.ts'
import type { GeoStream, GeoRawProjection, GeoObject } from './types.ts'

export function circleStream(stream: GeoStream, radius: number, delta: number, direction: number, t0: number[] | null, t1: number[] | null): void {
  if (!delta) return
  const cosRadius = cos(radius)
  const sinRadius = sin(radius)
  const step = direction * delta
  let start: number, end: number
  if (t0 == null) {
    start = radius + direction * tau
    end = radius - step / 2
  // eslint-disable-next-line pickier/no-unused-vars
  }
  else {
    start = circleRadius(cosRadius, t0)
    end = circleRadius(cosRadius, t1!)
    if (direction > 0 ? start < end : start > end) start += direction * tau
  }
  for (let point: number[], t = start; direction > 0 ? t > end : t < end; t -= step) {
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

interface GeoCircleGenerator {
  (this: unknown): GeoObject
  // eslint-disable-next-line pickier/no-unused-vars
  center(_: number[] | ((...args: unknown[]) => number[])): GeoCircleGenerator
  // eslint-disable-next-line pickier/no-unused-vars
  radius(_: number | ((...args: unknown[]) => number)): GeoCircleGenerator
  // eslint-disable-next-line pickier/no-unused-vars
  precision(_: number | ((...args: unknown[]) => number)): GeoCircleGenerator
}

export default function geoCircle(): GeoCircleGenerator {
  let center: (...args: unknown[]) => number[] = constant([0, 0]),
      radius: (...args: unknown[]) => number = constant(90),
      precision: (...args: unknown[]) => number = constant(2),
      ring: number[][],
      rotate: GeoRawProjection['invert'],
      stream: { point(x: number, y: number): void } = { point: point }

  function point(x: number, y: number): void {
    const p = rotate!(x, y)
    ring.push(p)
    p[0] *= degrees, p[1] *= degrees
  }

  function circle(this: unknown): GeoObject {
    const c = center.apply(this, arguments as unknown as unknown[]),
        r = radius.apply(this, arguments as unknown as unknown[]) * radians,
        p = precision.apply(this, arguments as unknown as unknown[]) * radians
    ring = []
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert
    circleStream(stream as GeoStream, r, p, 1, null, null)
    const result: GeoObject = { type: 'Polygon', coordinates: [ring] }
    ring = rotate = null!
    return result
  }

  circle.center = function (_: number[] | ((...args: unknown[]) => number[])): GeoCircleGenerator {
    // eslint-disable-next-line pickier/no-unused-vars
    return center = typeof _ === 'function' ? _ as (...args: unknown[]) => number[] : constant([+(_  as number[])[0], +(_ as number[])[1]]), circle
  }

  circle.radius = function (_: number | ((...args: unknown[]) => number)): GeoCircleGenerator {
    // eslint-disable-next-line pickier/no-unused-vars
    return radius = typeof _ === 'function' ? _ as (...args: unknown[]) => number : constant(+_), circle
  }

  circle.precision = function (_: number | ((...args: unknown[]) => number)): GeoCircleGenerator {
    // eslint-disable-next-line pickier/no-unused-vars
    return precision = typeof _ === 'function' ? _ as (...args: unknown[]) => number : constant(+_), circle
  }

  return circle
}
