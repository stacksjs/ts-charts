export default function ZoomEvent(this: Record<string, unknown>, type: string, {
  sourceEvent,
  target,
  transform,
  dispatch,
}: {
  sourceEvent: Event | null
  target: unknown
  transform: unknown
  dispatch: unknown
}): void {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform, enumerable: true, configurable: true },
    _: { value: dispatch },
  })
}
