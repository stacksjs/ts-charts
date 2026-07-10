import type { CurveContext, CurveGenerator } from './linear.ts'
import noop from '../noop.ts'

function LinearClosed(this: any, context: CurveContext): void {
  this._context = context
}

Object.assign(LinearClosed.prototype, {
  areaStart: noop,
  areaEnd: noop,
  lineStart(this: any): void  {
    this._point = 0
  },
  lineEnd(this: any): void  {
    if (this._point) this._context.closePath()
  },
  point(this: any, x: number, y: number): void  {
    x = +x, y = +y
    if (this._point) this._context.lineTo(x, y)
    else this._point = 1, this._context.moveTo(x, y)
  },
})

export default function curveLinearClosed(context: CurveContext): CurveGenerator {
  return new (LinearClosed as any)(context)
}
