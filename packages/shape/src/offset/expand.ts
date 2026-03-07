import none from './none.ts'

export default function offsetExpand(series: any[], order: number[]): void {
  if (!((n = series.length) > 0)) return
  let n: number
  for (let i: number, j = 0, m = series[0].length, y: number; j < m; ++j) {
    for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0
    if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y
  }
  none(series, order)
}
