import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

const sqrt3: number = sqrt(3)

export default {
  draw(context: CurveContext, size: number): void {
    const s = sqrt(size) * 0.6824
    const t = s / 2
    const u = (s * sqrt3) / 2 // cos(Math.PI / 6)
    context.moveTo(0, -s)
    context.lineTo(u, t)
    context.lineTo(-u, t)
    context.closePath()
  },
} as SymbolType
