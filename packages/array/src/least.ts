import ascending from './ascending.ts'

export default function least(values: Iterable<any>, compare: any = ascending): any {
  let min: any
  let defined = false
  if (compare.length === 1) {
    let minValue: any
    for (const element of values) {
      const value = compare(element)
      if (defined
          ? ascending(value, minValue) < 0
          : ascending(value, value) === 0) {
        min = element
        minValue = value
        defined = true
      }
    }
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    for (const value of values) {
      if (defined
          ? compare(value, min) < 0
          : compare(value, value) === 0) {
        min = value
        defined = true
      }
    }
  }
  return min
}
