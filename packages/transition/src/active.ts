import { Transition } from './transition/index.ts'
import { SCHEDULED } from './transition/schedule.ts'

const root: [null] = [null]

export default function active(node: any, name?: string | null): Transition | null {
  const schedules = node.__transition
  let schedule: any
  let i: string

  if (schedules) {
    const n = name == null ? null : name + ''
    for (i in schedules) {
      if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === n) {
        return new Transition([[node]], root, n, +i)
      }
    }
  }

  return null
}
