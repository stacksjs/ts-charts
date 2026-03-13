export default function extent(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): [any, any] {
  let min: any
  let max: any
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value
        // eslint-disable-next-line pickier/no-unused-vars
        } else {
          if (min > value) min = value
          if (max < value) max = value
        }
      }
    }
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    let index = -1
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value
        // eslint-disable-next-line pickier/no-unused-vars
        } else {
          if (min > value) min = value
          if (max < value) max = value
        }
      }
    }
  }
  return [min, max]
}
