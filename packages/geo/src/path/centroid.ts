import { sqrt } from '../math.ts'

let X0 = 0,
    Y0 = 0,
    Z0 = 0,
    X1 = 0,
    Y1 = 0,
    Z1 = 0,
    X2 = 0,
    Y2 = 0,
    Z2 = 0,
    x00: number,
    y00: number,
    x0: number,
    y0: number

const centroidStream: any = {
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function (): void {
    centroidStream.lineStart = centroidRingStart
    centroidStream.lineEnd = centroidRingEnd
  },
  polygonEnd: function (): void {
    centroidStream.point = centroidPoint
    centroidStream.lineStart = centroidLineStart
    centroidStream.lineEnd = centroidLineEnd
  },
  result: function (): number[] {
    const centroid = Z2 ? [X2 / Z2, Y2 / Z2]
        : Z1 ? [X1 / Z1, Y1 / Z1]
        : Z0 ? [X0 / Z0, Y0 / Z0]
        : [NaN, NaN]
    X0 = Y0 = Z0 =
    X1 = Y1 = Z1 =
    X2 = Y2 = Z2 = 0
    return centroid
  }
}

function centroidPoint(x: number, y: number): void {
  X0 += x
  Y0 += y
  ++Z0
}

function centroidLineStart(): void {
  centroidStream.point = centroidPointFirstLine
}

function centroidPointFirstLine(x: number, y: number): void {
  centroidStream.point = centroidPointLine
  centroidPoint(x0 = x, y0 = y)
}

function centroidPointLine(x: number, y: number): void {
  const dx = x - x0, dy = y - y0, z = sqrt(dx * dx + dy * dy)
  X1 += z * (x0 + x) / 2
  Y1 += z * (y0 + y) / 2
  Z1 += z
  centroidPoint(x0 = x, y0 = y)
}

function centroidLineEnd(): void {
  centroidStream.point = centroidPoint
}

function centroidRingStart(): void {
  centroidStream.point = centroidPointFirstRing
}

function centroidRingEnd(): void {
  centroidPointRing(x00, y00)
}

function centroidPointFirstRing(x: number, y: number): void {
  centroidStream.point = centroidPointRing
  centroidPoint(x00 = x0 = x, y00 = y0 = y)
}

function centroidPointRing(x: number, y: number): void {
  const dx = x - x0,
      dy = y - y0
  let z = sqrt(dx * dx + dy * dy)

  X1 += z * (x0 + x) / 2
  Y1 += z * (y0 + y) / 2
  Z1 += z

  z = y0 * x - x0 * y
  X2 += z * (x0 + x)
  Y2 += z * (y0 + y)
  Z2 += z * 3
  centroidPoint(x0 = x, y0 = y)
}

export default centroidStream
