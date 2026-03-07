import array from './array.ts'
import constant from './constant.ts'
import curveLinear from './curve/linear.ts'
import { withPath } from './path.ts'
import { x as pointX, y as pointY } from './point.ts'

export default function(x?: any, y?: any): any {
  let defined: any = constant(true)
  let context: any = null
  let curve: any = curveLinear
  let output: any = null
  const path = withPath(line)

  x = typeof x === 'function' ? x : (x === undefined) ? pointX : constant(x)
  y = typeof y === 'function' ? y : (y === undefined) ? pointY : constant(y)

  function line(data: any): any {
    let i: number
    const n = (data = array(data)).length
    let d: any
    let defined0 = false
    let buffer: any

    if (context == null) output = curve(buffer = path())

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart()
        else output.lineEnd()
      }
      if (defined0) output.point(+x(d, i, data), +y(d, i, data))
    }

    if (buffer) return output = null, buffer + '' || null
  }

  line.x = function (_?: any): any {
    return arguments.length ? (x = typeof _ === 'function' ? _ : constant(+_), line) : x
  }

  line.y = function (_?: any): any {
    return arguments.length ? (y = typeof _ === 'function' ? _ : constant(+_), line) : y
  }

  line.defined = function (_?: any): any {
    return arguments.length ? (defined = typeof _ === 'function' ? _ : constant(!!_), line) : defined
  }

  line.curve = function (_?: any): any {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve
  }

  line.context = function (_?: any): any {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context
  }

  return line
}
