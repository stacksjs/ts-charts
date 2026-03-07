import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size) * 0.4431
    context.moveTo(r, r)
    context.lineTo(r, -r)
    context.lineTo(-r, -r)
    context.lineTo(-r, r)
    context.closePath()
  },
} as SymbolType
