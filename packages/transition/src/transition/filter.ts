import { matcher } from '@ts-charts/selection'
import { Transition } from './index.ts'

export default function (this: any, match: any): any {
  if (typeof match !== 'function') match = matcher(match)

  for (let groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (let group = groups[j], n = group.length, subgroup = subgroups[j] = [] as any[], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node)
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id)
}
