import { selector } from '@ts-charts/selection'
import { Transition } from './index.ts'
import schedule, { get } from './schedule.ts'

export default function (this: any, select: any): any {
  const name = this._name
  const id = this._id

  if (typeof select !== 'function') select = selector(select)

  for (let groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (let group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ('__data__' in node) subnode.__data__ = node.__data__
        subgroup[i] = subnode
        schedule(subgroup[i], name, id, i, subgroup, get(node, id))
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id)
}
