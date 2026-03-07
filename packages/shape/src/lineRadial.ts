import curveRadial, { curveRadialLinear } from './curve/radial.ts'
import line from './line.ts'

export function lineRadial(l: any): any {
  const c = l.curve

  l.angle = l.x, delete l.x
  l.radius = l.y, delete l.y

  l.curve = function (_?: any): any {
    return arguments.length ? c(curveRadial(_)) : c()._curve
  }

  return l
}

export default function(): any {
  return lineRadial(line().curve(curveRadialLinear))
}
