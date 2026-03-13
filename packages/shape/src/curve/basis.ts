import type { CurveContext, CurveGenerator } from './linear.ts'

interface BasisState {
  _context: CurveContext
  _x0: number
  _x1: number
  _y0: number
  _y1: number
}

export function point(that: BasisState, x: number, y: number): void {
  that._context.bezierCurveTo(
    (2 * that._x0 + that._x1) / 3,
    (2 * that._y0 + that._y1) / 3,
    (that._x0 + 2 * that._x1) / 3,
    (that._y0 + 2 * that._y1) / 3,
    (that._x0 + 4 * that._x1 + x) / 6,
    (that._y0 + 4 * that._y1 + y) / 6,
  )
}

export function Basis(this: any, context: CurveContext): void {
  this._context = context
}

Basis.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._x0 = this._x1 =
    this._y0 = this._y1 = NaN
    this._point = 0
  },
  lineEnd(): void {
    switch (this._point) {
      // eslint-disable-next-line pickier/no-unused-vars
      case 3: point(this, this._x1, this._y1); this._context.lineTo(this._x1, this._y1); break
      // eslint-disable-next-line pickier/no-unused-vars
      case 2: this._context.lineTo(this._x1, this._y1); break
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath()
    this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    x = +x, y = +y
    switch (this._point) {
      // eslint-disable-next-line pickier/no-unused-vars
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break
      // eslint-disable-next-line pickier/no-unused-vars
      case 1: this._point = 2; break
      // eslint-disable-next-line pickier/no-unused-vars
      case 2: this._point = 3; this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); point(this, x, y); break
      // eslint-disable-next-line pickier/no-unused-vars
      default: point(this, x, y); break
    }
    this._x0 = this._x1, this._x1 = x
    this._y0 = this._y1, this._y1 = y
  },
}

export default function curveBasis(context: CurveContext): CurveGenerator {
  return new (Basis as any)(context)
}
