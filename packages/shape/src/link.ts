import { slice } from './array.ts'
import constant from './constant.ts'
import { bumpX, bumpY, bumpRadial } from './curve/bump.ts'
import { withPath } from './path.ts'
import { x as pointX, y as pointY } from './point.ts'

function linkSource(d: any): any {
  return d.source
}

function linkTarget(d: any): any {
  return d.target
}

export function link(curve?: any): any {
  let source: any = linkSource
  let target: any = linkTarget
  let x: any = pointX
  let y: any = pointY
  let context: any = null
  let output: any = null
  const path = withPath(link)

  function link(this: any): any {
    let buffer: any
    const argv = slice.call(arguments)
    const s = source.apply(this, argv)
    const t = target.apply(this, argv)
    if (context == null) output = curve(buffer = path())
    output.lineStart()
    argv[0] = s, output.point(+x.apply(this, argv), +y.apply(this, argv))
    argv[0] = t, output.point(+x.apply(this, argv), +y.apply(this, argv))
    output.lineEnd()
    if (buffer) return output = null, buffer + '' || null
  }

  link.source = function (_?: any): any {
    return arguments.length ? (source = _, link) : source
  }

  link.target = function (_?: any): any {
    return arguments.length ? (target = _, link) : target
  }

  link.x = function (_?: any): any {
    return arguments.length ? (x = typeof _ === 'function' ? _ : constant(+_), link) : x
  }

  link.y = function (_?: any): any {
    return arguments.length ? (y = typeof _ === 'function' ? _ : constant(+_), link) : y
  }

  link.context = function (_?: any): any {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), link) : context
  }

  return link
}

export function linkHorizontal(): any {
  return link(bumpX)
}

export function linkVertical(): any {
  return link(bumpY)
}

export function linkRadial(): any {
  const l = link(bumpRadial)
  l.angle = l.x, delete l.x
  l.radius = l.y, delete l.y
  return l
}
