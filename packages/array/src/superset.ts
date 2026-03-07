export default function superset(values: Iterable<any>, other: Iterable<any>): boolean {
  const iterator = (values as any)[Symbol.iterator]()
  const set = new Set()
  for (const o of other) {
    const io = intern(o)
    if (set.has(io)) continue
    let value: any, done: boolean | undefined
    while (({ value, done } = iterator.next())) {
      if (done) return false
      const ivalue = intern(value)
      set.add(ivalue)
      if (Object.is(io, ivalue)) break
    }
  }
  return true
}

function intern(value: any): any {
  return value !== null && typeof value === 'object' ? value.valueOf() : value
}
