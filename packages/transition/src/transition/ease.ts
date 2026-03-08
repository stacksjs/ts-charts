import { get, set } from './schedule.ts'

function easeConstant(id: number, value: (t: number) => number): () => void {
  if (typeof value !== 'function') throw new Error()
  return function (this: Element): void {
    set(this, id).ease = value
  }
}

export default function (this: { _id: number; node: () => Element; each: Function }, value?: (t: number) => number): unknown {
  const id = this._id

  return arguments.length
    ? this.each(easeConstant(id, value!))
    : get(this.node(), id).ease
}
