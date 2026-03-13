import type { StackSeries, StackSeriesPoint } from './none.ts'

export default function offsetDiverging(series: StackSeries[], order: number[]): void {
  let n: number
  if (!((n = series.length) > 0)) return
  for (let i: number, j = 0, d: StackSeriesPoint, dy: number, yp: number, yn: number, m = series[order[0]].length; j < m; ++j) {
    for (yp = yn = 0, i = 0; i < n; ++i) {
      if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
        d[0] = yp, d[1] = yp += dy
      // eslint-disable-next-line pickier/no-unused-vars
      } else if (dy < 0) {
        d[1] = yn, d[0] = yn += dy
      // eslint-disable-next-line pickier/no-unused-vars
      } else {
        d[0] = 0, d[1] = dy
      }
    }
  }
}
