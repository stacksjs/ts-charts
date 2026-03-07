import { get, set } from './schedule.ts'

function easeConstant(id: number, value: any): () => void {
  if (typeof value !== 'function') throw new Error()
  return function (this: any): void {
    set(this, id).ease = value
  }
}

export default function (this: any, value?: any): any {
  const id = this._id

  return arguments.length
    ? this.each(easeConstant(id, value))
    : get(this.node(), id).ease
}
