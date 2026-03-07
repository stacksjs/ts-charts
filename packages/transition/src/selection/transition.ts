import { Transition, newId } from '../transition/index.ts'
import schedule from '../transition/schedule.ts'
import { easeCubicInOut } from '@ts-charts/ease'
import { now } from '@ts-charts/timer'
import type { TransitionTiming } from '../transition/schedule.ts'

const defaultTiming: TransitionTiming = {
  time: null,
  delay: 0,
  duration: 250,
  ease: easeCubicInOut,
}

function inherit(node: any, id: number): TransitionTiming {
  let timing: any
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id} not found`)
    }
  }
  return timing
}

export default function selectionTransition(this: any, name?: any): Transition {
  let id: number
  let timing: TransitionTiming | undefined

  if (name instanceof Transition) {
    id = name._id
    name = name._name
  }
  else {
    id = newId()
    timing = { ...defaultTiming, time: now() }
    name = name == null ? null : name + ''
  }

  for (let groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (let group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id))
      }
    }
  }

  return new Transition(groups, this._parents, name, id)
}
