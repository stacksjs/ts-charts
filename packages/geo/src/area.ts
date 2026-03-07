import { Adder } from '@ts-charts/array'
import { atan2, cos, quarterPi, radians, sin, tau } from './math.ts'
import noop from './noop.ts'
import stream from './stream.ts'

export let areaRingSum: Adder = new Adder()

let areaSum = new Adder()
let lambda00: number
let phi00: number
let lambda0: number
let cosPhi0: number
let sinPhi0: number

export const areaStream: any = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function (): void {
    areaRingSum = new Adder()
    areaStream.lineStart = areaRingStart
    areaStream.lineEnd = areaRingEnd
  },
  polygonEnd: function (this: any): void {
    const areaRing = +areaRingSum
    areaSum.add(areaRing < 0 ? tau + areaRing : areaRing)
    this.lineStart = this.lineEnd = this.point = noop
  },
  sphere: function (): void {
    areaSum.add(tau)
  }
}

function areaRingStart(): void {
  areaStream.point = areaPointFirst
}

function areaRingEnd(): void {
  areaPoint(lambda00, phi00)
}

function areaPointFirst(lambda: number, phi: number): void {
  areaStream.point = areaPoint
  lambda00 = lambda, phi00 = phi
  lambda *= radians, phi *= radians
  lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi)
}

function areaPoint(lambda: number, phi: number): void {
  lambda *= radians, phi *= radians
  phi = phi / 2 + quarterPi

  const dLambda = lambda - lambda0
  const sdLambda = dLambda >= 0 ? 1 : -1
  const adLambda = sdLambda * dLambda
  const cosPhi = cos(phi)
  const sinPhi = sin(phi)
  const k = sinPhi0 * sinPhi
  const u = cosPhi0 * cosPhi + k * cos(adLambda)
  const v = k * sdLambda * sin(adLambda)
  areaRingSum.add(atan2(v, u))

  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi
}

export default function geoArea(object: any): number {
  areaSum = new Adder()
  stream(object, areaStream)
  return (areaSum as any) * 2
}
