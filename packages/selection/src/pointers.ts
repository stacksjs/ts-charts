import pointer from './pointer.ts'
import sourceEvent from './sourceEvent.ts'

interface D3Event extends Event {
  sourceEvent?: D3Event
  touches?: Iterable<Event>
}

export default function pointers(events: D3Event | Iterable<Event>, node?: Element): Array<[number, number]> {
  if ('target' in events) { // i.e., instanceof Event, not TouchList or iterable
    const resolved = sourceEvent(events as D3Event) as D3Event
    if (node === undefined) node = resolved.currentTarget as Element
    events = resolved.touches || [resolved]
  }
  return Array.from(events as Iterable<Event>, (event: Event) => pointer(event, node))
}
