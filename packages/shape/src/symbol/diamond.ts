import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

const tan30: number = sqrt(1 / 3)
const tan30_2: number = tan30 * 2

export default {
  draw(context: CurveContext, size: number): void {
    const y = sqrt(size / tan30_2)
    const x = y * tan30
    context.moveTo(0, -y)
    context.lineTo(x, 0)
    context.lineTo(0, y)
    context.lineTo(-x, 0)
    context.closePath()
  },
} as SymbolType
