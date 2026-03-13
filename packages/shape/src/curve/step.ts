import type { CurveContext, CurveGenerator } from './linear.ts'

function Step(this: any, context: CurveContext, t: number): void {
  this._context = context
  this._t = t
}

Step.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._x = this._y = NaN
    this._point = 0
  },
  lineEnd(): void {
    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y)
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath()
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    x = +x, y = +y
    switch (this._point) {
      // eslint-disable-next-line pickier/no-unused-vars
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break
      case 1: {
        this._point = 2
        if (this._t <= 0) {
          this._context.lineTo(this._x, y)
          this._context.lineTo(x, y)
        // eslint-disable-next-line pickier/no-unused-vars
        } else {
          const x1 = this._x * (1 - this._t) + x * this._t
          this._context.lineTo(x1, this._y)
          this._context.lineTo(x1, y)
        }
        break
      }
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y)
          this._context.lineTo(x, y)
        // eslint-disable-next-line pickier/no-unused-vars
        } else {
          const x1 = this._x * (1 - this._t) + x * this._t
          this._context.lineTo(x1, this._y)
          this._context.lineTo(x1, y)
        }
        break
      }
    }
    this._x = x, this._y = y
  },
}

export default function curveStep(context: CurveContext): CurveGenerator {
  return new (Step as any)(context, 0.5)
}

export function stepBefore(context: CurveContext): CurveGenerator {
  return new (Step as any)(context, 0)
}

export function stepAfter(context: CurveContext): CurveGenerator {
  return new (Step as any)(context, 1)
}
