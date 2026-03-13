import { STARTING, ENDING, ENDED, type TransitionSchedule } from './transition/schedule.ts'

interface TransitionNode extends Element {
  __transition?: Record<string, TransitionSchedule>
  __data__?: unknown
}

export default function interrupt(node: Element, name?: string | null): void {
  const tNode = node as TransitionNode
  const schedules = tNode.__transition
  let schedule: TransitionSchedule
  let active: boolean
  let empty = true
  let i: string

  if (!schedules) return

  // eslint-disable-next-line pickier/no-unused-vars
  const n = name == null ? null : name + ''

  for (i in schedules) {
    // eslint-disable-next-line pickier/no-unused-vars
    if ((schedule = schedules[i]).name !== n) { empty = false; continue }
    active = schedule.state > STARTING && schedule.state < ENDING
    schedule.state = ENDED
    schedule.timer.stop()
    schedule.on.call(active ? 'interrupt' : 'cancel', node, tNode.__data__, schedule.index, schedule.group)
    delete schedules[i]
  }

  if (empty) delete tNode.__transition
}
