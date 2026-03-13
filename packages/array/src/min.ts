export default function min(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): any {
  let min: any
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value
      }
    }
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    let index = -1
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value
      }
    }
  }
  return min
}
