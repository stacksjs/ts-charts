export default function number(x: any): number {
  return x === null ? NaN : +x
}

export function* numbers(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): Generator<number> {
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value
      }
    }
  }
  else {
    let index = -1
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        yield value
      }
    }
  }
}
