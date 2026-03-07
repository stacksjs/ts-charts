import { min, sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size - min(size / 6, 1.7)) * 0.6189
    context.moveTo(-r, -r)
    context.lineTo(r, r)
    context.moveTo(-r, r)
    context.lineTo(r, -r)
  },
} as SymbolType
