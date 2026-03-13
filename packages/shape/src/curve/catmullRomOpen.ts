import type { CurveContext, CurveGenerator } from './linear.ts'
import { CardinalOpen } from './cardinalOpen.ts'
import { point } from './catmullRom.ts'

function CatmullRomOpen(this: any, context: CurveContext, alpha: number): void {
  this._context = context
  this._alpha = alpha
}

CatmullRomOpen.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._x0 = this._x1 = this._x2 =
    this._y0 = this._y1 = this._y2 = NaN
    this._l01_a = this._l12_a = this._l23_a =
    this._l01_2a = this._l12_2a = this._l23_2a =
    this._point = 0
  },
  lineEnd(): void {
    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath()
    this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    x = +x, y = +y

    if (this._point) {
      const x23 = this._x2 - x
      const y23 = this._y2 - y
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha))
    }

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

    this._l01_a = this._l12_a, this._l12_a = this._l23_a
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y
  },
}

export interface CatmullRomOpenCurveFactory {
  (context: CurveContext): CurveGenerator
  alpha(alpha: number): CatmullRomOpenCurveFactory
}

export default (function custom(alpha: number): CatmullRomOpenCurveFactory {
  function catmullRom(context: CurveContext): CurveGenerator {
    return alpha ? new (CatmullRomOpen as any)(context, alpha) : new (CardinalOpen as any)(context, 0)
  }

  catmullRom.alpha = function (alpha: number): CatmullRomOpenCurveFactory {
    return custom(+alpha)
  }

  return catmullRom as CatmullRomOpenCurveFactory
})(0.5) as CatmullRomOpenCurveFactory
