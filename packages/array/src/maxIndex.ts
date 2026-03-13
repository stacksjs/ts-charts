export default function maxIndex(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): number {
  let max: any
  let maxIndex = -1
  let index = -1
  if (valueof === undefined) {
    for (const value of values) {
      ++index
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index
      }
    }
  }
  else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index
      }
    }
  }
  return maxIndex
}
