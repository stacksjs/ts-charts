import noop from '../noop.ts'

let x0 = Infinity,
    y0 = x0,
    x1 = -x0,
    y1 = x1

const boundsStream: any = {
  point: boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function (): number[][] {
    const bounds = [[x0, y0], [x1, y1]]
    x1 = y1 = -(y0 = x0 = Infinity)
    return bounds
  }
}

function boundsPoint(x: number, y: number): void {
  if (x < x0) x0 = x
  if (x > x1) x1 = x
  if (y < y0) y0 = y
  if (y > y1) y1 = y
}

export default boundsStream
