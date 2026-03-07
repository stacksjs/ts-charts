export default function reverse(values: Iterable<any>): any[] {
  if (typeof (values as any)[Symbol.iterator] !== 'function') throw new TypeError('values is not iterable')
  return Array.from(values).reverse()
}
