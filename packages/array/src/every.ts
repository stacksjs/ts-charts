export default function every(values: Iterable<any>, test: (value: any, index: number, values: Iterable<any>) => boolean): boolean {
  if (typeof test !== 'function') throw new TypeError('test is not a function')
  let index = -1
  for (const value of values) {
    if (!test(value, ++index, values)) {
      return false
    }
  }
  return true
}
