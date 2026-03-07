import { get, set } from './schedule.ts'

function durationFunction(id: number, value: any): () => void {
  return function (this: any): void {
    set(this, id).duration = +value.apply(this, arguments)
  }
}

function durationConstant(id: number, value: any): () => void {
  return (value = +value, function (this: any): void {
    set(this, id).duration = value
  })
}

export default function (this: any, value?: any): any {
  const id = this._id

  return arguments.length
    ? this.each((typeof value === 'function'
        ? durationFunction
        : durationConstant)(id, value))
    : get(this.node(), id).duration
}
