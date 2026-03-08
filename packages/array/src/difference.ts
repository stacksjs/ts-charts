import { InternSet } from '@ts-charts/internmap'

export default function difference(values: Iterable<any>, ...others: Iterable<any>[]): InternSet {
  const set = new InternSet(values)
  for (const other of others) {
    for (const value of other) {
      set.delete(value)
    }
  }
  return set
}
