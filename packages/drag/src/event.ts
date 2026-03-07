export default class DragEvent {
  readonly type!: string
  readonly sourceEvent: any
  readonly subject: any
  readonly target: any
  readonly identifier: any
  readonly active!: number
  readonly x!: number
  readonly y!: number
  readonly dx!: number
  readonly dy!: number
  private readonly _: any

  constructor(type: string, {
    sourceEvent,
    subject,
    target,
    identifier,
    active,
    x, y, dx, dy,
    dispatch
  }: {
    sourceEvent: any
    subject?: any
    target: any
    identifier: any
    active: number
    x: number
    y: number
    dx: number
    dy: number
    dispatch: any
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

  on(...args: any[]): any {
    const value = this._.on.apply(this._, args)
    return value === this._ ? this : value
  }
}
