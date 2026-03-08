import { Transition, newId } from '../transition/index.ts'
import schedule from '../transition/schedule.ts'
import { easeCubicInOut } from '@ts-charts/ease'
import { now } from '@ts-charts/timer'
import type { TransitionTiming, TransitionSchedule } from '../transition/schedule.ts'

interface TransitionNode extends Element {
  __transition?: Record<number, TransitionSchedule>
}

const defaultTiming: TransitionTiming = {
  time: null,
  delay: 0,
  duration: 250,
  ease: easeCubicInOut,
}

function inherit(node: Element, id: number): TransitionTiming {
  let timing: TransitionSchedule | undefined
  let current: Element | null = node
  while (!(timing = (current as TransitionNode).__transition?.[id])) {
    if (!(current = current.parentElement)) {
      throw new Error(`transition ${id} not found`)
    }
  }
  return timing
}

export default function selectionTransition(this: { _groups: Array<Array<Element | null>>; _parents: Array<Element | null> }, name?: string | Transition): Transition {
  let id: number
  let timing: TransitionTiming | undefined
  let transitionName: string | null

  if (name instanceof Transition) {
    id = name._id
    transitionName = name._name
  }
  else {
    id = newId()
    timing = { ...defaultTiming, time: now() }
    transitionName = name == null ? null : name + ''
  }

  const groups = this._groups
  for (let m = groups.length, j = 0; j < m; ++j) {
    for (let group = groups[j], n = group.length, node: Element | null, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, transitionName, id, i, group, timing || inherit(node, id))
      }
    }
  }

  return new Transition(groups, this._parents, transitionName, id)
}
