import { Adder } from '@ts-charts/array'
import { sqrt } from '../math.ts'
import noop from '../noop.ts'

let lengthSum = new Adder(),
    lengthRing: boolean | null,
    x00: number,
    y00: number,
    x0: number,
    y0: number

const lengthStream: any = {
  point: noop,
  lineStart: function (): void {
    lengthStream.point = lengthPointFirst
  },
  lineEnd: function (): void {
    if (lengthRing) lengthPoint(x00, y00)
    lengthStream.point = noop
  },
  polygonStart: function (): void {
    lengthRing = true
  },
  polygonEnd: function (): void {
    lengthRing = null
  },
  result: function (): number {
    const length = +lengthSum
    lengthSum = new Adder()
    return length
  }
}

function lengthPointFirst(x: number, y: number): void {
  lengthStream.point = lengthPoint
  x00 = x0 = x, y00 = y0 = y
}

function lengthPoint(x: number, y: number): void {
  x0 -= x, y0 -= y
  lengthSum.add(sqrt(x0 * x0 + y0 * y0))
  x0 = x, y0 = y
}

export default lengthStream
