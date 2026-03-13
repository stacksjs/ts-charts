export interface CurveContext {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void
  closePath(): void
  arc?(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean): void
  rect?(x: number, y: number, w: number, h: number): void
}

export interface CurveGenerator {
  areaStart(): void
  areaEnd(): void
  lineStart(): void
  lineEnd(): void
  point(x: number, y: number): void
}

export interface CurveFactory {
  (context: CurveContext): CurveGenerator
}

function Linear(this: any, context: CurveContext): void {
  this._context = context
}

Linear.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._point = 0
  },
  lineEnd(): void {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath()
    this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    x = +x, y = +y
    switch (this._point) {
      // eslint-disable-next-line pickier/no-unused-vars
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break
      // eslint-disable-next-line pickier/no-unused-vars
      case 1: this._point = 2; this._context.lineTo(x, y); break
      // eslint-disable-next-line pickier/no-unused-vars
      default: this._context.lineTo(x, y); break
    }
  },
}

export default function curveLinear(context: CurveContext): CurveGenerator {
  return new (Linear as any)(context)
}
