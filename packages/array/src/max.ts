export default function max(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): any {
  let max: any
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value
      }
    }
  } else {
    let index = -1
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value
      }
    }
  }
  return max
}
