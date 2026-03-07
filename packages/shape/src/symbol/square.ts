import { sqrt } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

export default {
  draw(context: CurveContext, size: number): void {
    const w = sqrt(size)
    const x = -w / 2
    context.rect!(x, x, w, w)
  },
} as SymbolType
