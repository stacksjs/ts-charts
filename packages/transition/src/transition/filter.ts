import { matcher } from '@ts-charts/selection'
import { Transition } from './index.ts'

interface TransitionNode extends Element {
  __data__?: unknown
}

export default function (this: Transition, match: string | ((this: Element, d: unknown, i: number, group: ArrayLike<Element | null>) => boolean)): Transition {
  if (typeof match !== 'function') match = matcher(match)

  const groups = this._groups
  const m = groups.length
  const subgroups = new Array(m)
  for (let j = 0; j < m; ++j) {
    const group = groups[j]
    const n = group.length
    const subgroup: Array<Element | null> = subgroups[j] = []
    for (let node: Element | null, i = 0; i < n; ++i) {
      if ((node = group[i]) && (match as Function).call(node, (node as TransitionNode).__data__, i, group)) {
        subgroup.push(node)
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id)
}
