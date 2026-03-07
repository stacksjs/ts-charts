import { Transition, newId } from './index.ts'
import schedule, { get } from './schedule.ts'

export default function (this: any): any {
  const name = this._name
  const id0 = this._id
  const id1 = newId()

  const groups = this._groups
  for (let m = groups.length, j = 0; j < m; ++j) {
    for (let group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        const inherit = get(node, id0)
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease,
        })
      }
    }
  }

  return new Transition(groups, this._parents, name, id1)
}
