import { InternSet } from '@ts-charts/internmap'

export default function disjoint(values: Iterable<any>, other: Iterable<any>): boolean {
  const iterator = (other as any)[Symbol.iterator]()
  const set = new InternSet()
  for (const v of values) {
    if (set.has(v)) return false
    let value: any, done: boolean | undefined
    while (({ value, done } = iterator.next())) {
      if (done) break
      if (Object.is(v, value)) return false
      set.add(value)
    }
  }
  return true
}
