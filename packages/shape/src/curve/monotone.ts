import type { CurveContext, CurveGenerator } from './linear.ts'

function sign(x: number): number {
  return x < 0 ? -1 : 1
}

// Calculate the slopes of the tangents (Hermite-type interpolation) based on
// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
// NOV(II), P. 443, 1990.
function slope3(that: any, x2: number, y2: number): number {
  const h0 = that._x1 - that._x0
  const h1 = x2 - that._x1
  const s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0)
  const s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0)
  const p = (s0 * h1 + s1 * h0) / (h0 + h1)
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0
}

// Calculate a one-sided slope.
function slope2(that: any, t: number): number {
  const h = that._x1 - that._x0
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t
}

// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
// "you can express cubic Hermite interpolation in terms of cubic Bezier curves
// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
function pointM(that: any, t0: number, t1: number): void {
  const x0 = that._x0
  const y0 = that._y0
  const x1 = that._x1
  const y1 = that._y1
  const dx = (x1 - x0) / 3
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1)
}

function MonotoneX(this: any, context: CurveContext): void {
  this._context = context
}

MonotoneX.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._x0 = this._x1 =
    this._y0 = this._y1 =
    this._t0 = NaN
    this._point = 0
  },
  lineEnd(): void {
    switch (this._point) {
      case 2: this._context.lineTo(this._x1, this._y1); break
      case 3: pointM(this, this._t0, slope2(this, this._t0)); break
    }
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath()
    this._line = 1 - this._line
  },
  point(x: number, y: number): void {
    let t1 = NaN

    x = +x, y = +y
    if (x === this._x1 && y === this._y1) return // Ignore coincident points.
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break
      case 1: this._point = 2; break
      case 2: this._point = 3; pointM(this, slope2(this, t1 = slope3(this, x, y)), t1); break
      default: pointM(this, this._t0, t1 = slope3(this, x, y)); break
    }

    this._x0 = this._x1, this._x1 = x
    this._y0 = this._y1, this._y1 = y
    this._t0 = t1
  },
}

function MonotoneY(this: any, context: CurveContext): void {
  this._context = new (ReflectContext as any)(context)
}

;(MonotoneY as any).prototype = Object.create(MonotoneX.prototype)
;(MonotoneY as any).prototype.point = function (x: number, y: number): void {
  MonotoneX.prototype.point.call(this, y, x)
}

function ReflectContext(this: any, context: CurveContext): void {
  this._context = context
}

ReflectContext.prototype = {
  moveTo(x: number, y: number): void { this._context.moveTo(y, x) },
  closePath(): void { this._context.closePath() },
  lineTo(x: number, y: number): void { this._context.lineTo(y, x) },
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void { this._context.bezierCurveTo(y1, x1, y2, x2, y, x) },
}

export function monotoneX(context: CurveContext): CurveGenerator {
  return new (MonotoneX as any)(context)
}

export function monotoneY(context: CurveContext): CurveGenerator {
  return new (MonotoneY as any)(context)
}
