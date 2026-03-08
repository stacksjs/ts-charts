interface D3Event extends Event {
  sourceEvent?: D3Event
}

export default function sourceEvent(event: D3Event): Event {
  let src: D3Event | undefined
  while (src = event.sourceEvent) event = src
  return event
}
