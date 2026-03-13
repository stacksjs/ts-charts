import { get, set, init, type TransitionSchedule } from './schedule.ts'
import type { Dispatch } from '@ts-charts/dispatch'

function start(name: string): boolean {
  // eslint-disable-next-line pickier/no-unused-vars
  return (name + '').trim().split(/^|\s+/).every(function (t) {
    const i = t.indexOf('.')
    if (i >= 0) t = t.slice(0, i)
    return !t || t === 'start'
  })
}

function onFunction(id: number, name: string, listener: ((...args: unknown[]) => void) | null): () => void {
  let on0: Dispatch, on1: Dispatch
  const sit = start(name) ? init : set
  return function (this: Element): void {
    const schedule = sit(this, id)
    const on = schedule.on

    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener)

    schedule.on = on1
  }
}

// eslint-disable-next-line pickier/no-unused-vars
export default function (this: { _id: number; node: () => Element; each: Function }, name: string, listener?: ((...args: unknown[]) => void) | null): unknown {
  const id = this._id

  return arguments.length < 2
    ? get(this.node(), id).on.on(name)
    : this.each(onFunction(id, name, listener ?? null))
}
