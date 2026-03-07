import { pi, sqrt, tau } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size / pi)
    context.moveTo(r, 0)
    context.arc!(0, 0, r, 0, tau)
  },
} as SymbolType
