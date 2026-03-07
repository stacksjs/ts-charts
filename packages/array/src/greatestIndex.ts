import ascending from './ascending.ts'
import maxIndex from './maxIndex.ts'

export default function greatestIndex(values: Iterable<any>, compare: any = ascending): number {
  if (compare.length === 1) return maxIndex(values, compare)
  let maxValue: any
  let max = -1
  let index = -1
  for (const value of values) {
    ++index
    if (max < 0
        ? compare(value, value) === 0
        : compare(value, maxValue) > 0) {
      maxValue = value
      max = index
    }
  }
  return max
}
