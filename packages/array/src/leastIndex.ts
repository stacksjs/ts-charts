import ascending from './ascending.ts'
import minIndex from './minIndex.ts'

export default function leastIndex(values: Iterable<any>, compare: any = ascending): number {
  if (compare.length === 1) return minIndex(values, compare)
  let minValue: any
  let min = -1
  let index = -1
  for (const value of values) {
    ++index
    if (min < 0
        ? compare(value, value) === 0
        : compare(value, minValue) < 0) {
      minValue = value
      min = index
    }
  }
  return min
}
