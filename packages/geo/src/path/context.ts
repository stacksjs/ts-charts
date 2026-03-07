import { tau } from '../math.ts'
import noop from '../noop.ts'

export default class PathContext {
  _context: any
  _radius: number = 4.5
  _line: number = NaN
  _point: number = NaN

  constructor(context: any) {
    this._context = context
  }

  pointRadius(_: number): this {
    return this._radius = _, this
  }

  polygonStart(): void {
    this._line = 0
  }

  polygonEnd(): void {
    this._line = NaN
  }

  lineStart(): void {
    this._point = 0
  }

  lineEnd(): void {
    if (this._line === 0) this._context.closePath()
    this._point = NaN
  }

  point(x: number, y: number): void {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y)
        this._point = 1
        break
      }
      case 1: {
        this._context.lineTo(x, y)
        break
      }
      default: {
        this._context.moveTo(x + this._radius, y)
        this._context.arc(x, y, this._radius, 0, tau)
        break
      }
    }
  }

  result: () => void = noop
}
