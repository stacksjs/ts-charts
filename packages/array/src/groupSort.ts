import ascending from './ascending.ts'
import group, { rollup } from './group.ts'
import sort from './sort.ts'

export default function groupSort(values: Iterable<any>, reduce: any, key: (value: any, index: number, values: Iterable<any>) => any): any[] {
  return (reduce.length !== 2
    ? sort(rollup(values, reduce, key), (([ak, av]: [any, any], [bk, bv]: [any, any]) => ascending(av, bv) || ascending(ak, bk)))
    : sort(group(values, key), (([ak, av]: [any, any], [bk, bv]: [any, any]) => reduce(av, bv) || ascending(ak, bk))))
    .map(([key]: [any]) => key)
}
