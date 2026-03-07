import { min, sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size - min(size / 7, 2)) * 0.87559
    context.moveTo(-r, 0)
    context.lineTo(r, 0)
    context.moveTo(0, r)
    context.lineTo(0, -r)
  },
} as SymbolType
