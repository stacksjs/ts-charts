import ascending from './ascending.ts'
import permute from './permute.ts'

export default function sort(values: Iterable<any>, ...F: any[]): any[] {
  if (typeof (values as any)[Symbol.iterator] !== 'function') throw new TypeError('values is not iterable')
  values = Array.from(values)
  let [f] = F
  if ((f && f.length !== 2) || F.length > 1) {
    const index = Uint32Array.from(values as any, (_d: any, i: number) => i)
    if (F.length > 1) {
      F = F.map(f => (values as any).map(f))
      index.sort((i: number, j: number) => {
        for (const f of F) {
          const c = ascendingDefined(f[i], f[j])
          if (c) return c
        }
        return 0
      })
    // eslint-disable-next-line pickier/no-unused-vars
    } else {
      f = (values as any).map(f)
      index.sort((i: number, j: number) => ascendingDefined(f[i], f[j]))
    }
    return permute(values as any, index)
  }
  return (values as any[]).sort(compareDefined(f))
}

export function compareDefined(compare: (a: any, b: any) => number = ascending): (a: any, b: any) => number {
  if (compare === ascending) return ascendingDefined
  if (typeof compare !== 'function') throw new TypeError('compare is not a function')
  return (a: any, b: any) => {
    const x = compare(a, b)
    if (x || x === 0) return x
    return (compare(b, b) === 0 ? 1 : 0) - (compare(a, a) === 0 ? 1 : 0)
  }
}

export function ascendingDefined(a: any, b: any): number {
  return (a == null || !(a >= a) ? 1 : 0) - (b == null || !(b >= b) ? 1 : 0) || (a < b ? -1 : a > b ? 1 : 0)
}
