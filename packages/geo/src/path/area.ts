import { Adder } from '@ts-charts/array'
import { abs } from '../math.ts'
import noop from '../noop.ts'
import type { GeoStream } from '../types.ts'

let areaSum = new Adder(),
    areaRingSum = new Adder(),
    x00: number,
    y00: number,
    x0: number,
    y0: number

const areaStream: GeoStream & { result(): number } = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function (): void {
    areaStream.lineStart = areaRingStart
    areaStream.lineEnd = areaRingEnd
  },
  polygonEnd: function (): void {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop
    areaSum.add(abs(+areaRingSum))
    areaRingSum = new Adder()
  },
  result: function (): number {
    const area = +areaSum / 2
    areaSum = new Adder()
    return area
  }
}

function areaRingStart(): void {
  areaStream.point = areaPointFirst
}

function areaPointFirst(x: number, y: number): void {
  areaStream.point = areaPoint
  x00 = x0 = x, y00 = y0 = y
}

function areaPoint(x: number, y: number): void {
  areaRingSum.add(y0 * x - x0 * y)
  x0 = x, y0 = y
}

function areaRingEnd(): void {
  areaPoint(x00, y00)
}

export default areaStream
