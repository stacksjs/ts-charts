export default function BrushEvent(this: any, type: string, {
  sourceEvent,
  target,
  selection,
  mode,
  dispatch,
}: {
  sourceEvent: any
  target: any
  selection: any
  mode: any
  dispatch: any
}): void {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    selection: { value: selection, enumerable: true, configurable: true },
    mode: { value: mode, enumerable: true, configurable: true },
    _: { value: dispatch },
  })
}
