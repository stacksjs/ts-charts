import { selectorAll } from '@ts-charts/selection'
import { Transition } from './index.ts'
import schedule, { get } from './schedule.ts'

export default function (this: any, select: any): any {
  const name = this._name
  const id = this._id

  if (typeof select !== 'function') select = selectorAll(select)

  const groups = this._groups
  const m = groups.length
  const subgroups: any[] = []
  const parents: any[] = []
  for (let j = 0; j < m; ++j) {
    const group = groups[j]
    const n = group.length
    for (let node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        const children = select.call(node, node.__data__, i, group)
        const inherit = get(node, id)
        for (let child, k = 0, l = children.length; k < l; ++k) {
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
