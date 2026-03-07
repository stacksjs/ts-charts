import constant from './constant.ts'
import { withPath } from './path.ts'
import asterisk from './symbol/asterisk.ts'
import circle from './symbol/circle.ts'
import cross from './symbol/cross.ts'
import diamond from './symbol/diamond.ts'
import diamond2 from './symbol/diamond2.ts'
import plus from './symbol/plus.ts'
import square from './symbol/square.ts'
import square2 from './symbol/square2.ts'
import star from './symbol/star.ts'
import triangle from './symbol/triangle.ts'
import triangle2 from './symbol/triangle2.ts'
import wye from './symbol/wye.ts'
import times from './symbol/times.ts'
import type { SymbolType } from './symbol/asterisk.ts'

// These symbols are designed to be filled.
export const symbolsFill: SymbolType[] = [
  circle,
  cross,
  diamond,
  square,
  star,
  triangle,
  wye,
]

// These symbols are designed to be stroked (with a width of 1.5px and round caps).
export const symbolsStroke: SymbolType[] = [
  circle,
  plus,
  times,
  triangle2,
  asterisk,
  square2,
  diamond2,
]

export default function Symbol(type?: any, size?: any): any {
  let context: any = null
  const path = withPath(symbol)

  type = typeof type === 'function' ? type : constant(type || circle)
  size = typeof size === 'function' ? size : constant(size === undefined ? 64 : +size)

  function symbol(this: any): any {
    let buffer: any
    if (!context) context = buffer = path()
    type.apply(this, arguments).draw(context, +size.apply(this, arguments))
    if (buffer) return context = null, buffer + '' || null
  }

  symbol.type = function (_?: any): any {
    return arguments.length ? (type = typeof _ === 'function' ? _ : constant(_), symbol) : type
  }

  symbol.size = function (_?: any): any {
    return arguments.length ? (size = typeof _ === 'function' ? _ : constant(+_), symbol) : size
  }

  symbol.context = function (_?: any): any {
    return arguments.length ? (context = _ == null ? null : _, symbol) : context
  }

  return symbol
}
