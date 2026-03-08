import { InternSet } from '@ts-charts/internmap'

export default function intersection(values: Iterable<any>, ...others: Iterable<any>[]): InternSet {
  const set = new InternSet(values)
  const otherSets = others.map(toSet)
  out: for (const value of set) {
    for (const other of otherSets) {
      if (!other.has(value)) {
        set.delete(value)
        continue out
      }
    }
  }
  return set
}

function toSet(values: Iterable<any>): InternSet {
  return values instanceof InternSet ? values : new InternSet(values)
}
