export default function sum(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): number {
  let sum = 0
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        sum += value
      }
    }
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    let index = -1
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum += value
      }
    }
  }
  return sum
}
