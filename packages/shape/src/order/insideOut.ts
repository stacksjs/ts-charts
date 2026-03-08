import type { StackSeries } from '../offset/none.ts'
import appearance from './appearance.ts'
import { sum } from './ascending.ts'

export default function orderInsideOut(series: StackSeries[]): number[] {
  const n = series.length
  let i: number
  let j: number
  const sums = series.map(sum)
  const order = appearance(series)
  let top = 0
  let bottom = 0
  const tops: number[] = []
  const bottoms: number[] = []

  for (i = 0; i < n; ++i) {
    j = order[i]
    if (top < bottom) {
      top += sums[j]
      tops.push(j)
    } else {
      bottom += sums[j]
      bottoms.push(j)
    }
  }

  return bottoms.reverse().concat(tops)
}
