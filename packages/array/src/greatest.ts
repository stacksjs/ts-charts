import ascending from './ascending.ts'

export default function greatest(values: Iterable<any>, compare: any = ascending): any {
  let max: any
  let defined = false
  if (compare.length === 1) {
    let maxValue: any
    for (const element of values) {
      const value = compare(element)
      if (defined
          ? ascending(value, maxValue) > 0
          : ascending(value, value) === 0) {
        max = element
        maxValue = value
        defined = true
      }
    }
  } else {
    for (const value of values) {
      if (defined
          ? compare(value, max) > 0
          : compare(value, value) === 0) {
        max = value
        defined = true
      }
    }
  }
  return max
}
