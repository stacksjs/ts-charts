import { Adder } from '@ts-charts/array'
import { asin, atan2, cos, degrees, epsilon, epsilon2, hypot, radians, sin, sqrt } from './math.ts'
import noop from './noop.ts'
import stream from './stream.ts'
import type { GeoStream, GeoObject } from './types.ts'

let W0: number, W1: number,
    X0: number, Y0: number, Z0: number,
    X1: number, Y1: number, Z1: number,
    X2: Adder, Y2: Adder, Z2: Adder,
    lambda00: number, phi00: number,
    x0: number, y0: number, z0: number

const centroidStream: GeoStream = {
  sphere: noop,
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function (): void {
    centroidStream.lineStart = centroidRingStart
    centroidStream.lineEnd = centroidRingEnd
  },
  polygonEnd: function (): void {
    centroidStream.lineStart = centroidLineStart
    centroidStream.lineEnd = centroidLineEnd
  }
}

function centroidPoint(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  const cosPhi = cos(phi)
  centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi))
}

function centroidPointCartesian(x: number, y: number, z: number): void {
  ++W0
  X0 += (x - X0) / W0
  Y0 += (y - Y0) / W0
  Z0 += (z - Z0) / W0
}

function centroidLineStart(): void {
  centroidStream.point = centroidLinePointFirst
}

function centroidLinePointFirst(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  const cosPhi = cos(phi)
  x0 = cosPhi * cos(lambda)
  y0 = cosPhi * sin(lambda)
  z0 = sin(phi)
  centroidStream.point = centroidLinePoint
  centroidPointCartesian(x0, y0, z0)
}

function centroidLinePoint(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  const cosPhi = cos(phi)
  const x = cosPhi * cos(lambda)
  const y = cosPhi * sin(lambda)
  const z = sin(phi)
  const w = atan2(sqrt((y0 * z - z0 * y) ** 2 + (z0 * x - x0 * z) ** 2 + (x0 * y - y0 * x) ** 2), x0 * x + y0 * y + z0 * z)
  W1 += w
  X1 += w * (x0 + (x0 = x))
  Y1 += w * (y0 + (y0 = y))
  Z1 += w * (z0 + (z0 = z))
  centroidPointCartesian(x0, y0, z0)
}

function centroidLineEnd(): void {
  centroidStream.point = centroidPoint
}

function centroidRingStart(): void {
  centroidStream.point = centroidRingPointFirst
}

function centroidRingEnd(): void {
  centroidRingPoint(lambda00, phi00)
  centroidStream.point = centroidPoint
}

function centroidRingPointFirst(lambda: number, phi: number): void {
  lambda00 = lambda, phi00 = phi
  lambda *= radians, phi *= radians
  centroidStream.point = centroidRingPoint
  const cosPhi = cos(phi)
  x0 = cosPhi * cos(lambda)
  y0 = cosPhi * sin(lambda)
  z0 = sin(phi)
  centroidPointCartesian(x0, y0, z0)
}

function centroidRingPoint(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  const cosPhi = cos(phi)
  const x = cosPhi * cos(lambda)
  const y = cosPhi * sin(lambda)
  const z = sin(phi)
  const cx = y0 * z - z0 * y
  const cy = z0 * x - x0 * z
  const cz = x0 * y - y0 * x
  const m = hypot(cx, cy, cz)
  const w = asin(m)
  const v = m && -w / m
  X2.add(v * cx)
  Y2.add(v * cy)
  Z2.add(v * cz)
  W1 += w
  X1 += w * (x0 + (x0 = x))
  Y1 += w * (y0 + (y0 = y))
  Z1 += w * (z0 + (z0 = z))
  centroidPointCartesian(x0, y0, z0)
}

export default function geoCentroid(object: GeoObject): number[] {
  W0 = W1 =
  X0 = Y0 = Z0 =
  X1 = Y1 = Z1 = 0
  X2 = new Adder()
  Y2 = new Adder()
  Z2 = new Adder()
  stream(object, centroidStream)

  let x = +X2,
      y = +Y2,
      z = +Z2,
      m = hypot(x, y, z)

  if (m < epsilon2) {
    x = X1, y = Y1, z = Z1
    if (W1 < epsilon) x = X0, y = Y0, z = Z0
    m = hypot(x, y, z)
    if (m < epsilon2) return [NaN, NaN]
  }

  return [atan2(y, x) * degrees, asin(z / m) * degrees]
}
