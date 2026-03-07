export default function filter(values: Iterable<any>, test: (value: any, index: number, values: Iterable<any>) => boolean): any[] {
  if (typeof test !== 'function') throw new TypeError('test is not a function')
  const array: any[] = []
  let index = -1
  for (const value of values) {
    if (test(value, ++index, values)) {
      array.push(value)
    }
  }
  return array
}
