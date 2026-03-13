import type { CurveContext, CurveGenerator } from './linear.ts'
import { point } from './cardinal.ts'

export function CardinalOpen(this: any, context: CurveContext, tension: number): void {
  this._context = context
  this._k = (1 - tension) / 6
}

CardinalOpen.prototype = {
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
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath()
    this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    x = +x, y = +y
    switch (this._point) {
      // eslint-disable-next-line pickier/no-unused-vars
      case 0: this._point = 1; break
      // eslint-disable-next-line pickier/no-unused-vars
      case 1: this._point = 2; break
      // eslint-disable-next-line pickier/no-unused-vars
      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break
      // eslint-disable-next-line pickier/no-unused-vars
      case 3: this._point = 4; point(this, x, y); break
      // eslint-disable-next-line pickier/no-unused-vars
      default: point(this, x, y); break
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y
  },
}

export interface CardinalOpenCurveFactory {
  (context: CurveContext): CurveGenerator
  tension(tension: number): CardinalOpenCurveFactory
}

export default (function custom(tension: number): CardinalOpenCurveFactory {
  function cardinal(context: CurveContext): CurveGenerator {
    return new (CardinalOpen as any)(context, tension)
  }

  cardinal.tension = function (tension: number): CardinalOpenCurveFactory {
    return custom(+tension)
  }

  return cardinal as CardinalOpenCurveFactory
})(0) as CardinalOpenCurveFactory
