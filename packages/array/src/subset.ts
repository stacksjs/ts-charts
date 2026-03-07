import superset from './superset.ts'

export default function subset(values: Iterable<any>, other: Iterable<any>): boolean {
  return superset(other, values)
}
