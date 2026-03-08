import { Adder } from '@ts-charts/array'
import { abs, atan2, cos, radians, sin, sqrt } from './math.ts'
import noop from './noop.ts'
import stream from './stream.ts'
import type { GeoStream, GeoObject } from './types.ts'

let lengthSum: Adder,
    lambda0: number,
    sinPhi0: number,
    cosPhi0: number

const lengthStream: GeoStream = {
  sphere: noop,
  point: noop,
  lineStart: lengthLineStart,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop
}

function lengthLineStart(): void {
  lengthStream.point = lengthPointFirst
  lengthStream.lineEnd = lengthLineEnd
}

function lengthLineEnd(): void {
  lengthStream.point = lengthStream.lineEnd = noop
}

function lengthPointFirst(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  lambda0 = lambda, sinPhi0 = sin(phi), cosPhi0 = cos(phi)
  lengthStream.point = lengthPoint
}

function lengthPoint(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  const sinPhi = sin(phi),
      cosPhi = cos(phi),
      delta = abs(lambda - lambda0),
      cosDelta = cos(delta),
      sinDelta = sin(delta),
      x = cosPhi * sinDelta,
      y = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDelta,
      z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDelta
  lengthSum.add(atan2(sqrt(x * x + y * y), z))
  lambda0 = lambda, sinPhi0 = sinPhi, cosPhi0 = cosPhi
}

export default function geoLength(object: GeoObject): number {
  lengthSum = new Adder()
  stream(object, lengthStream)
  return +lengthSum
}
