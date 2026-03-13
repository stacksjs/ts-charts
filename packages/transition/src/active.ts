import { Transition } from './transition/index.ts'
import { SCHEDULED, type TransitionSchedule } from './transition/schedule.ts'

interface TransitionNode extends Element {
  __transition?: Record<string, TransitionSchedule>
}

const root: [null] = [null]

export default function active(node: Element, name?: string | null): Transition | null {
  const schedules = (node as TransitionNode).__transition
  let schedule: TransitionSchedule
  let i: string

  if (schedules) {
    // eslint-disable-next-line pickier/no-unused-vars
    const n = name == null ? null : name + ''
    for (i in schedules) {
      if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === n) {
        return new Transition([[node]], root, n, +i)
      }
    }
  }

  return null
}
