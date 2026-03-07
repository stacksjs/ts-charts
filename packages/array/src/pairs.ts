export default function pairs(values: Iterable<any>, pairof: (a: any, b: any) => any = pair): any[] {
  const pairs: any[] = []
  let previous: any
  let first = false
  for (const value of values) {
    if (first) pairs.push(pairof(previous, value))
    previous = value
    first = true
  }
  return pairs
}

export function pair(a: any, b: any): [any, any] {
  return [a, b]
}
