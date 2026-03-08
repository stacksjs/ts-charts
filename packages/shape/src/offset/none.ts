export type StackSeriesPoint = [number, number] & { data?: unknown }
export type StackSeries = StackSeriesPoint[] & { key?: string, index?: number }

export default function offsetNone(series: StackSeries[], order: number[]): void {
  let n: number
  if (!((n = series.length) > 1)) return
  for (let i = 1, s0: StackSeries, s1: StackSeries = series[order[0]], m = s1.length; i < n; ++i) {
    s0 = s1, s1 = series[order[i]]
    for (let j = 0; j < m; ++j) {
      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1]
    }
  }
}
