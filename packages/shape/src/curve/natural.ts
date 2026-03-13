import type { CurveContext, CurveGenerator } from './linear.ts'

function Natural(this: any, context: CurveContext): void {
  this._context = context
}

Natural.prototype = {
  areaStart(): void {
    this._line = 0
  },
  areaEnd(): void {
    this._line = NaN
  },
  lineStart(): void {
    this._x = []
    this._y = []
  },
  lineEnd(): void {
    const x: number[] = this._x
    const y: number[] = this._y
    const n: number = x.length

    if (n) {
      this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0])
      if (n === 2) {
        this._context.lineTo(x[1], y[1])
      // eslint-disable-next-line pickier/no-unused-vars
      } else {
        const px = controlPoints(x)
        const py = controlPoints(y)
        for (let i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1])
        }
      }
    }

    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath()
    this._line = 1 - this._line
    this._x = this._y = null
  },
  point(x: number, y: number): void {
    this._x.push(+x)
    this._y.push(+y)
  },
}

// See https://www.particleincell.com/2012/bezier-splines/ for derivation.
function controlPoints(x: number[]): [number[], number[]] {
  let i: number
  const n: number = x.length - 1
  let m: number
  const a: number[] = new Array(n)
  const b: number[] = new Array(n)
  const r: number[] = new Array(n)
  a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1]
  for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1]
  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n]
  for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1]
  a[n - 1] = r[n - 1] / b[n - 1]
  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i]
  b[n - 1] = (x[n] + a[n - 1]) / 2
  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1]
  return [a, b]
}

export default function curveNatural(context: CurveContext): CurveGenerator {
  return new (Natural as any)(context)
}
