import { set } from './schedule.ts'

function easeVarying(id: number, value: Function): () => void {
  return function (this: Element): void {
    const v = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (typeof v !== 'function') throw new Error()
    set(this, id).ease = v
  }
}

export default function (this: { _id: number; each: Function }, value: Function): unknown {
  if (typeof value !== 'function') throw new Error()
  return this.each(easeVarying(this._id, value))
}
