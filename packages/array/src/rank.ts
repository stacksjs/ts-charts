import ascending from './ascending.ts'
import { ascendingDefined, compareDefined } from './sort.ts'

export default function rank(values: Iterable<any>, valueof: any = ascending): Float64Array {
  if (typeof (values as any)[Symbol.iterator] !== 'function') throw new TypeError('values is not iterable')
  let V = Array.from(values)
  const R = new Float64Array(V.length)
  if (valueof.length !== 2) V = V.map(valueof), valueof = ascending
  const compareIndex = (i: number, j: number): number => valueof(V[i], V[j])
  let k: number | undefined, r: number
  let indices: any = Uint32Array.from(V as any, (_: any, i: number) => i)
  // Risky chaining due to Safari 14 https://github.com/d3/d3-array/issues/123
  indices.sort(valueof === ascending ? (i: number, j: number) => ascendingDefined(V[i], V[j]) : compareDefined(compareIndex))
  indices.forEach((j: number, i: number) => {
    const c = compareIndex(j, k === undefined ? j : k)
    if (c >= 0) {
      if (k === undefined || c > 0) k = j, r = i
      R[j] = r!
    } else {
      R[j] = NaN
    }
  })
  return R
}
