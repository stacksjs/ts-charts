import { InternSet } from '@ts-charts/internmap'

export default function difference(values: Iterable<any>, ...others: Iterable<any>[]): InternSet {
  values = new InternSet(values) as any
  for (const other of others) {
    for (const value of other) {
      (values as any).delete(value)
    }
  }
  return values as any
}
