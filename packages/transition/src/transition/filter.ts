import { matcher } from '@ts-charts/selection'
import { Transition } from './index.ts'

export default function (this: any, match: any): any {
  if (typeof match !== 'function') match = matcher(match)

  const groups = this._groups
  const m = groups.length
  const subgroups = new Array(m)
  for (let j = 0; j < m; ++j) {
    const group = groups[j]
    const n = group.length
    const subgroup = subgroups[j] = [] as any[]
    for (let node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node)
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id)
}
