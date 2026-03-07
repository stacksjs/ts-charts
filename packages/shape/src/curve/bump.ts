import type { CurveContext, CurveGenerator } from './linear.ts'
import pointRadial from '../pointRadial.ts'

class Bump {
  _context: CurveContext
  _x: boolean
  _line!: number
  _point!: number
  _x0!: number
  _y0!: number

  constructor(context: CurveContext, x: boolean) {
    this._context = context
    this._x = x
  }

  areaStart(): void {
    this._line = 0
  }

  areaEnd(): void {
    this._line = NaN
  }

  lineStart(): void {
    this._point = 0
  }

  lineEnd(): void {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath()
    this._line = 1 - this._line
  }

  point(x: number, y: number): void {
    x = +x, y = +y
    switch (this._point) {
      case 0: {
        this._point = 1
        if (this._line) this._context.lineTo(x, y)
        else this._context.moveTo(x, y)
        break
      }
      case 1: {
        this._point = 2
        if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x) / 2, this._y0, this._x0, y, x, y)
        else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y) / 2, x, this._y0, x, y)
        break
      }
      default: {
        if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x) / 2, this._y0, this._x0, y, x, y)
        else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y) / 2, x, this._y0, x, y)
        break
      }
    }
    this._x0 = x, this._y0 = y
  }
}

class BumpRadial {
  _context: CurveContext
  _point!: number
  _x0!: number
  _y0!: number

  constructor(context: CurveContext) {
    this._context = context
  }

  lineStart(): void {
    this._point = 0
  }

  lineEnd(): void {}

  point(x: number, y: number): void {
    x = +x, y = +y
    if (this._point === 0) {
      this._point = 1
    } else {
      const p0 = pointRadial(this._x0, this._y0)
      const p1 = pointRadial(this._x0, this._y0 = (this._y0 + y) / 2)
      const p2 = pointRadial(x, this._y0)
      const p3 = pointRadial(x, y)
      this._context.moveTo(...p0)
      this._context.bezierCurveTo(...p1, ...p2, ...p3)
    }
    this._x0 = x, this._y0 = y
  }
}

export function bumpX(context: CurveContext): CurveGenerator {
  return new Bump(context, true) as unknown as CurveGenerator
}

export function bumpY(context: CurveContext): CurveGenerator {
  return new Bump(context, false) as unknown as CurveGenerator
}

export function bumpRadial(context: CurveContext): CurveGenerator {
  return new BumpRadial(context) as unknown as CurveGenerator
}
