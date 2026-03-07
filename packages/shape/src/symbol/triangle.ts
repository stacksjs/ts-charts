import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

const sqrt3: number = sqrt(3)

export default {
  draw(context: CurveContext, size: number): void {
    const y = -sqrt(size / (sqrt3 * 3))
    context.moveTo(0, y * 2)
    context.lineTo(-sqrt3 * y, -y)
    context.lineTo(sqrt3 * y, -y)
    context.closePath()
  },
} as SymbolType
