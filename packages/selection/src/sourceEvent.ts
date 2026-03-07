export default function sourceEvent(event: any): any {
  let sourceEvent
  while (sourceEvent = event.sourceEvent) event = sourceEvent
  return event
}
