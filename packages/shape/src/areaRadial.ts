import curveRadial, { curveRadialLinear } from './curve/radial.ts'
import area from './area.ts'
import { lineRadial } from './lineRadial.ts'

export default function(): any {
  const a = area().curve(curveRadialLinear)
  const c = a.curve
  const x0 = a.lineX0
  const x1 = a.lineX1
  const y0 = a.lineY0
  const y1 = a.lineY1

  a.angle = a.x, delete a.x
  a.startAngle = a.x0, delete a.x0
  a.endAngle = a.x1, delete a.x1
  a.radius = a.y, delete a.y
  a.innerRadius = a.y0, delete a.y0
  a.outerRadius = a.y1, delete a.y1
  a.lineStartAngle = function (): any { return lineRadial(x0()) }, delete a.lineX0
  a.lineEndAngle = function (): any { return lineRadial(x1()) }, delete a.lineX1
  a.lineInnerRadius = function (): any { return lineRadial(y0()) }, delete a.lineY0
  a.lineOuterRadius = function (): any { return lineRadial(y1()) }, delete a.lineY1

  a.curve = function (_?: any): any {
    return arguments.length ? c(curveRadial(_)) : c()._curve
  }

  return a
}
