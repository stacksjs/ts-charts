export default function minIndex(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): number {
  let min: any
  let minIndex = -1
  let index = -1
  if (valueof === undefined) {
    for (const value of values) {
      ++index
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index
      }
    }
  }
  return minIndex
}
