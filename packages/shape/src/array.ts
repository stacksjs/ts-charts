export const slice: typeof Array.prototype.slice = Array.prototype.slice

export default function array(x: any): any[] {
  return typeof x === 'object' && 'length' in x
    ? x // Array, TypedArray, NodeList, array-like
    : Array.from(x) // Map, Set, iterable, string, or anything else
}
