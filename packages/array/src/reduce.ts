export default function reduce(values: Iterable<any>, reducer: (accumulator: any, value: any, index: number, values: Iterable<any>) => any, value?: any): any {
  if (typeof reducer !== 'function') throw new TypeError('reducer is not a function')
  const iterator = (values as any)[Symbol.iterator]()
  let done: boolean | undefined, next: any, index = -1
  if (arguments.length < 3) {
    ({ done, value } = iterator.next())
    if (done) return
    ++index
  }
  while (({ done, value: next } = iterator.next()), !done) {
    value = reducer(value, next, ++index, values)
  }
  return value
}
