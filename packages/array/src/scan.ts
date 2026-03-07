import leastIndex from './leastIndex.ts'

export default function scan(values: Iterable<any>, compare?: (a: any, b: any) => number): number | undefined {
  const index = leastIndex(values, compare)
  return index < 0 ? undefined : index
}
