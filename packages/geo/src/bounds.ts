import { Adder } from '@ts-charts/array'
import { areaStream, areaRingSum } from './area.ts'
import { cartesian, cartesianCross, cartesianNormalizeInPlace, spherical } from './cartesian.ts'
import { abs, degrees, epsilon, radians } from './math.ts'
import stream from './stream.ts'

let lambda0: number, phi0: number, lambda1: number, phi1: number,
    lambda2: number,
    lambda00: number, phi00: number,
    p0: any,
    deltaSum: any,
    ranges: any[],
    range: any

const boundsStream: any = {
  point: boundsPoint,
  lineStart: boundsLineStart,
  lineEnd: boundsLineEnd,
  polygonStart: function (): void {
    boundsStream.point = boundsRingPoint
    boundsStream.lineStart = boundsRingStart
    boundsStream.lineEnd = boundsRingEnd
    deltaSum = new Adder()
    areaStream.polygonStart()
  },
  polygonEnd: function (): void {
    areaStream.polygonEnd()
    boundsStream.point = boundsPoint
    boundsStream.lineStart = boundsLineStart
    boundsStream.lineEnd = boundsLineEnd
    if (areaRingSum < 0 as any) lambda0 = -(lambda1 = 180), phi0 = -(phi1 = 90)
    else if (deltaSum > epsilon) phi1 = 90
    else if (deltaSum < -epsilon) phi0 = -90
    range[0] = lambda0, range[1] = lambda1
  },
  sphere: function (): void {
    lambda0 = -(lambda1 = 180), phi0 = -(phi1 = 90)
  }
}

function boundsPoint(lambda: number, phi: number): void {
  ranges.push(range = [lambda0 = lambda, lambda1 = lambda])
  if (phi < phi0) phi0 = phi
  if (phi > phi1) phi1 = phi
}

function linePoint(lambda: number, phi: number): void {
  const p = cartesian([lambda * radians, phi * radians])
  if (p0) {
    const normal = cartesianCross(p0, p)
    const equatorial: number[] = [normal[1], -normal[0], 0]
    const inflection = cartesianCross(equatorial, normal)
    cartesianNormalizeInPlace(inflection)
    const inflectionSpherical = spherical(inflection)
    const delta = lambda - lambda2
    const sign = delta > 0 ? 1 : -1
    let lambdai = inflectionSpherical[0] * degrees * sign
    let phii: number
    const antimeridian = abs(delta) > 180
    if (antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
      phii = inflectionSpherical[1] * degrees
      if (phii > phi1) phi1 = phii
    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign * lambda2 < lambdai && lambdai < sign * lambda)) {
      phii = -inflectionSpherical[1] * degrees
      if (phii < phi0) phi0 = phii
    } else {
      if (phi < phi0) phi0 = phi
      if (phi > phi1) phi1 = phi
    }
    if (antimeridian) {
      if (lambda < lambda2) {
        if (angle(lambda0, lambda) > angle(lambda0, lambda1)) lambda1 = lambda
      } else {
        if (angle(lambda, lambda1) > angle(lambda0, lambda1)) lambda0 = lambda
      }
    } else {
      if (lambda1 >= lambda0) {
        if (lambda < lambda0) lambda0 = lambda
        if (lambda > lambda1) lambda1 = lambda
      } else {
        if (lambda > lambda2) {
          if (angle(lambda0, lambda) > angle(lambda0, lambda1)) lambda1 = lambda
        } else {
          if (angle(lambda, lambda1) > angle(lambda0, lambda1)) lambda0 = lambda
        }
      }
    }
  } else {
    ranges.push(range = [lambda0 = lambda, lambda1 = lambda])
  }
  if (phi < phi0) phi0 = phi
  if (phi > phi1) phi1 = phi
  p0 = p, lambda2 = lambda
}

function boundsLineStart(): void {
  boundsStream.point = linePoint
}

function boundsLineEnd(): void {
  range[0] = lambda0, range[1] = lambda1
  boundsStream.point = boundsPoint
  p0 = null
}

function boundsRingPoint(lambda: number, phi: number): void {
  if (p0) {
    const delta = lambda - lambda2
    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta)
  } else {
    lambda00 = lambda, phi00 = phi
  }
  areaStream.point(lambda, phi)
  linePoint(lambda, phi)
}

function boundsRingStart(): void {
  areaStream.lineStart()
}

function boundsRingEnd(): void {
  boundsRingPoint(lambda00, phi00)
  areaStream.lineEnd()
  if (abs(deltaSum) > epsilon) lambda0 = -(lambda1 = 180)
  range[0] = lambda0, range[1] = lambda1
  p0 = null
}

function angle(lambda0: number, lambda1: number): number {
  return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1
}

function rangeCompare(a: number[], b: number[]): number {
  return a[0] - b[0]
}

function rangeContains(range: number[], x: number): boolean {
  return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x
}

export default function geoBounds(feature: any): number[][] {
  let i: number, n: number, a: any, b: any, merged: any[], deltaMax: number, delta: number

  phi1 = lambda1 = -(lambda0 = phi0 = Infinity)
  ranges = []
  stream(feature, boundsStream)

  if (n = ranges.length) {
    ranges.sort(rangeCompare)

    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
      b = ranges[i]
      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1]
        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0]
      } else {
        merged.push(a = b)
      }
    }

    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
      b = merged[i]
      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0 = b[0], lambda1 = a[1]
    }
  }

  ranges = range = null as any

  return lambda0 === Infinity || phi0 === Infinity
      ? [[NaN, NaN], [NaN, NaN]]
      : [[lambda0, phi0], [lambda1, phi1]]
}
