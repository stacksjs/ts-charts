import type { CurveContext, CurveGenerator } from './linear.ts'
import curveLinear from './linear.ts'

function Radial(this: any, curve: CurveGenerator): void {
  this._curve = curve
}

Object.assign(Radial.prototype, {
  areaStart(this: any): void  {
    this._curve.areaStart()
  },
  areaEnd(this: any): void  {
    this._curve.areaEnd()
  },
  lineStart(this: any): void  {
    this._curve.lineStart()
  },
  lineEnd(this: any): void  {
    this._curve.lineEnd()
  },
  point(this: any, a: number, r: number): void  {
    this._curve.point(r * Math.sin(a), r * -Math.cos(a))
  },
})

export default function curveRadial(curve: any): any {
  function radial(context: CurveContext): CurveGenerator {
    return new (Radial as any)(curve(context))
  }

  radial._curve = curve

  return radial
}

export const curveRadialLinear: any = curveRadial(curveLinear)
