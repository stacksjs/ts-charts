import { sin, cos, sqrt, pi, tau } from '../math.ts'
import type { SymbolType } from './asterisk.ts'
import type { CurveContext } from '../curve/linear.ts'

const ka: number = 0.89081309152928522810
const kr: number = sin(pi / 10) / sin(7 * pi / 10)
const kx: number = sin(tau / 10) * kr
const ky: number = -cos(tau / 10) * kr

export default {
  draw(context: CurveContext, size: number): void {
    const r = sqrt(size * ka)
    const x = kx * r
    const y = ky * r
    context.moveTo(0, -r)
    context.lineTo(x, y)
    for (let i = 1; i < 5; ++i) {
      const a = tau * i / 5
      const c = cos(a)
      const s = sin(a)
      context.lineTo(s * r, -c * r)
      context.lineTo(c * x - s * y, s * x + c * y)
    }
    context.closePath()
  },
} as SymbolType
