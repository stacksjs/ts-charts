import { get, set, init } from './schedule.ts'

function start(name: string): boolean {
  return (name + '').trim().split(/^|\s+/).every(function (t) {
    const i = t.indexOf('.')
    if (i >= 0) t = t.slice(0, i)
    return !t || t === 'start'
  })
}

function onFunction(id: number, name: string, listener: any): () => void {
  let on0: any, on1: any
  const sit = start(name) ? init : set
  return function (this: any): void {
    const schedule = sit(this, id)
    const on = schedule.on

    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener)

    schedule.on = on1
  }
}

export default function (this: any, name: string, listener?: any): any {
  const id = this._id

  return arguments.length < 2
    ? get(this.node(), id).on.on(name)
    : this.each(onFunction(id, name, listener))
}
