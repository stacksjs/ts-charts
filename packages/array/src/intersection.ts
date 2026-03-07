import { InternSet } from '@ts-charts/internmap'

export default function intersection(values: Iterable<any>, ...others: Iterable<any>[]): InternSet {
  values = new InternSet(values) as any
  const otherSets = others.map(toSet)
  out: for (const value of values as any) {
    for (const other of otherSets) {
      if (!other.has(value)) {
        (values as any).delete(value)
        continue out
      }
    }
  }
  return values as any
}

function toSet(values: Iterable<any>): InternSet {
  return values instanceof InternSet ? values : new InternSet(values)
}
