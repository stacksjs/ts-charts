import type { CurveContext, CurveGenerator } from './linear.ts'

export function point(that: any, x: number, y: number): void {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x),
    that._y2 + that._k * (that._y1 - y),
    that._x2,
    that._y2,
  )
}

export function Cardinal(this: any, context: CurveContext, tension: number): void {
  this._context = context
  this._k = (1 - tension) / 6
}

Cardinal.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN
    this._point = 0
  },
  lineEnd(): void {
    switch (this._point) {
      case 2: this._context.lineTo(this._x2, this._y2); break
      case 3: point(this, this._x1, this._y1); break
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath()
    this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    x = +x, y = +y
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break
      case 1: this._point = 2; this._x1 = x, this._y1 = y; break
      case 2: this._point = 3 // falls through
      default: point(this, x, y); break
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y
  },
}

export interface CardinalCurveFactory {
  (context: CurveContext): CurveGenerator
  tension(tension: number): CardinalCurveFactory
}

export default (function custom(tension: number): CardinalCurveFactory {
  function cardinal(context: CurveContext): CurveGenerator {
    return new (Cardinal as any)(context, tension)
  }

  cardinal.tension = function (tension: number): CardinalCurveFactory {
    return custom(+tension)
  }

  return cardinal as CardinalCurveFactory
})(0)
