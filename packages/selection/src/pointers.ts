import pointer from './pointer.ts'
import sourceEvent from './sourceEvent.ts'

export default function pointers(events: any, node?: any): Array<[number, number]> {
  if (events.target) { // i.e., instanceof Event, not TouchList or iterable
    events = sourceEvent(events)
    if (node === undefined) node = events.currentTarget
    events = events.touches || [events]
  }
  return Array.from(events, (event: any) => pointer(event, node))
}
