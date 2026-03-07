export default function ZoomEvent(this: any, type: string, {
  sourceEvent,
  target,
  transform,
  dispatch,
}: {
  sourceEvent: any
  target: any
  transform: any
  dispatch: any
}): void {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform, enumerable: true, configurable: true },
    _: { value: dispatch },
  })
}
