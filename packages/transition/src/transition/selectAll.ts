import { selectorAll } from '@ts-charts/selection'
import { Transition } from './index.ts'
import schedule, { get } from './schedule.ts'

interface TransitionNode extends Element {
  __data__?: unknown
}

export default function (this: Transition, select: string | Function): Transition {
  const name = this._name
  const id = this._id

  if (typeof select !== 'function') select = selectorAll(select)

  const groups = this._groups
  const m = groups.length
  const subgroups: Array<Array<Element | null>> = []
  const parents: Array<Element | null> = []
  for (let j = 0; j < m; ++j) {
    const group = groups[j]
    const n = group.length
    for (let node: Element | null, i = 0; i < n; ++i) {
      if (node = group[i]) {
        const children = select.call(node, (node as TransitionNode).__data__, i, group) as ArrayLike<Element>
        const inherit = get(node, id)
        for (let child: Element | null, k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children as unknown as Array<Element | null>, inherit)
          }
        }
        subgroups.push(Array.from(children) as Array<Element | null>)
        parents.push(node)
      }
    }
  }

  return new Transition(subgroups, parents, name, id)
}
