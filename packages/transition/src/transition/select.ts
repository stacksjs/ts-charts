import { selector } from '@ts-charts/selection'
import { Transition } from './index.ts'
import schedule, { get } from './schedule.ts'

interface TransitionNode extends Element {
  __data__?: unknown
}

export default function (this: Transition, select: string | Function): Transition {
  const name = this._name
  const id = this._id

  if (typeof select !== 'function') select = selector(select)

  const groups = this._groups
  const m = groups.length
  const subgroups = new Array(m)
  for (let j = 0; j < m; ++j) {
    const group = groups[j]
    const n = group.length
    const subgroup = subgroups[j] = new Array(n)
    for (let node: Element | null, subnode: Element | null, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, (node as TransitionNode).__data__, i, group))) {
        if ('__data__' in node) (subnode as TransitionNode).__data__ = (node as TransitionNode).__data__
        subgroup[i] = subnode
        schedule(subgroup[i], name, id, i, subgroup, get(node, id))
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id)
}
