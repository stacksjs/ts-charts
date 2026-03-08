import none from './none.ts'
import type { StackSeries } from './none.ts'

export default function offsetSilhouette(series: StackSeries[], order: number[]): void {
  let n: number
  if (!((n = series.length) > 0)) return
  for (let j = 0, s0 = series[order[0]], m = s0.length; j < m; ++j) {
    let y = 0
    for (let i = 0; i < n; ++i) y += series[i][j][1] || 0
    s0[j][1] += s0[j][0] = -y / 2
  }
  none(series, order)
}
