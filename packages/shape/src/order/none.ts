import type { StackSeries } from '../offset/none.ts'

export default function orderNone(series: StackSeries[]): number[] {
  const n = series.length
  const o = new Array(n)
  let i = n
  while (--i >= 0) o[i] = i
  return o
}
