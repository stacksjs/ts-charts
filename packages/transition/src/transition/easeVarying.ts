import { set } from './schedule.ts'

function easeVarying(id: number, value: any): () => void {
  return function (this: any): void {
    const v = value.apply(this, arguments)
    if (typeof v !== 'function') throw new Error()
    set(this, id).ease = v
  }
}

export default function (this: any, value: any): any {
  if (typeof value !== 'function') throw new Error()
  return this.each(easeVarying(this._id, value))
}
