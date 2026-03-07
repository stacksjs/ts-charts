import { min, sqrt } from '../math.ts'
import type { CurveContext } from '../curve/linear.ts'

const sqrt3: number = sqrt(3)

export interface SymbolType {
  draw(context: CurveContext, size: number): void
}

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size + min(size / 28, 0.75)) * 0.59436
    const t = r / 2
    const u = t * sqrt3
    context.moveTo(0, r)
    context.lineTo(0, -r)
    context.moveTo(-u, -t)
    context.lineTo(u, t)
    context.moveTo(-u, t)
    context.lineTo(u, -t)
  },
} as SymbolType
