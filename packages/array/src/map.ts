export default function map(values: Iterable<any>, mapper: (value: any, index: number, values: Iterable<any>) => any): any[] {
  if (typeof (values as any)[Symbol.iterator] !== 'function') throw new TypeError('values is not iterable')
  if (typeof mapper !== 'function') throw new TypeError('mapper is not a function')
  return Array.from(values, (value: any, index: number) => mapper(value, index, values))
}
