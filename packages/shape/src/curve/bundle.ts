import type { CurveContext, CurveGenerator } from './linear.ts'
import { Basis } from './basis.ts'

function Bundle(this: any, context: CurveContext, beta: number): void {
  this._basis = new (Basis as any)(context)
  this._beta = beta
}

Bundle.prototype = {
  lineStart(): void {
    this._x = []
    this._y = []
    this._basis.lineStart()
  },
  lineEnd(): void {
    const x: number[] = this._x
    const y: number[] = this._y
    const j: number = x.length - 1

    if (j > 0) {
      const x0: number = x[0]
      const y0: number = y[0]
      const dx: number = x[j] - x0
      const dy: number = y[j] - y0
      let i = -1
      let t: number

      while (++i <= j) {
        t = i / j
        this._basis.point(
          this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
          this._beta * y[i] + (1 - this._beta) * (y0 + t * dy),
        )
      }
    }

    this._x = this._y = null
    this._basis.lineEnd()
  },
  point(x: number, y: number): void {
    this._x.push(+x)
    this._y.push(+y)
  },
}

export interface BundleCurveFactory {
  (context: CurveContext): CurveGenerator
  beta(beta: number): BundleCurveFactory
}

export default (function custom(beta: number): BundleCurveFactory {
  function bundle(context: CurveContext): CurveGenerator {
    return beta === 1 ? new (Basis as any)(context) : new (Bundle as any)(context, beta)
  }

  bundle.beta = function (beta: number): BundleCurveFactory {
    return custom(+beta)
  }

  return bundle as BundleCurveFactory
})(0.85)
