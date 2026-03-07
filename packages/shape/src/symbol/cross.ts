import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size / 5) / 2
    context.moveTo(-3 * r, -r)
    context.lineTo(-r, -r)
    context.lineTo(-r, -3 * r)
    context.lineTo(r, -3 * r)
    context.lineTo(r, -r)
    context.lineTo(3 * r, -r)
    context.lineTo(3 * r, r)
    context.lineTo(r, r)
    context.lineTo(r, 3 * r)
    context.lineTo(-r, 3 * r)
    context.lineTo(-r, r)
    context.lineTo(-3 * r, r)
    context.closePath()
  },
} as SymbolType
