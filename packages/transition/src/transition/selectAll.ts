import { selectorAll } from '@ts-charts/selection'
import { Transition } from './index.ts'
import schedule, { get } from './schedule.ts'

export default function (this: any, select: any): any {
  const name = this._name
  const id = this._id

  if (typeof select !== 'function') select = selectorAll(select)

  for (let groups = this._groups, m = groups.length, subgroups: any[] = [], parents: any[] = [], j = 0; j < m; ++j) {
    for (let group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (let children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit)
          }
        }
        subgroups.push(children)
        parents.push(node)
      }
    }
  }

  return new Transition(subgroups, parents, name, id)
}
