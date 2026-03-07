import { InternSet } from '@ts-charts/internmap'

export default function union(...others: Iterable<any>[]): InternSet {
  const set = new InternSet()
  for (const other of others) {
    for (const o of other) {
      set.add(o)
    }
  }
  return set
}
