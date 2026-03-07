import { STARTING, ENDING, ENDED } from './transition/schedule.ts'

export default function interrupt(node: any, name?: string | null): void {
  const schedules = node.__transition
  let schedule: any
  let active: boolean
  let empty = true
  let i: string

  if (!schedules) return

  const n = name == null ? null : name + ''

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== n) { empty = false; continue }
    active = schedule.state > STARTING && schedule.state < ENDING
    schedule.state = ENDED
    schedule.timer.stop()
    schedule.on.call(active ? 'interrupt' : 'cancel', node, node.__data__, schedule.index, schedule.group)
    delete schedules[i]
  }

  if (empty) delete node.__transition
}
