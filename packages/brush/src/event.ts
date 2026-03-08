export default function BrushEvent(this: Record<string, unknown>, type: string, {
  sourceEvent,
  target,
  selection,
  mode,
  dispatch,
}: {
  sourceEvent: Event | null
  target: unknown
  selection: number[] | null
  mode: string | undefined
  dispatch: unknown
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
