import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size) * 0.62625
    context.moveTo(0, -r)
    context.lineTo(r, 0)
    context.lineTo(0, r)
    context.lineTo(-r, 0)
    context.closePath()
  },
} as SymbolType
