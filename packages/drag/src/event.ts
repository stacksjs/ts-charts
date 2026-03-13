interface DragDispatch {
  on(...args: unknown[]): unknown
}

export default class DragEvent {
  readonly type!: string
  declare readonly sourceEvent: Event
  // eslint-disable-next-line pickier/no-unused-vars
  declare readonly subject: { x: number; y: number } | undefined
  declare readonly target: unknown
  declare readonly identifier: string | number
  readonly active!: number
  readonly x!: number
  readonly y!: number
  readonly dx!: number
  readonly dy!: number
  private declare readonly _: DragDispatch

  constructor(type: string, {
    sourceEvent,
    subject,
    target,
    identifier,
    active,
    x, y, dx, dy,
    dispatch
  }: {
    sourceEvent: Event
    // eslint-disable-next-line pickier/no-unused-vars
    subject?: { x: number; y: number }
    target: unknown
    identifier: string | number
    active: number
    x: number
    y: number
    dx: number
    dy: number
    dispatch: DragDispatch
  }) {
    Object.defineProperties(this, {
      type: { value: type, enumerable: true, configurable: true },
      sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
      subject: { value: subject, enumerable: true, configurable: true },
      target: { value: target, enumerable: true, configurable: true },
      identifier: { value: identifier, enumerable: true, configurable: true },
      active: { value: active, enumerable: true, configurable: true },
      x: { value: x, enumerable: true, configurable: true },
      y: { value: y, enumerable: true, configurable: true },
      dx: { value: dx, enumerable: true, configurable: true },
      dy: { value: dy, enumerable: true, configurable: true },
      _: { value: dispatch }
    })
  }

  on(...args: unknown[]): unknown {
    const value = this._.on.apply(this._, args)
    return value === this._ ? this : value
  }
}
