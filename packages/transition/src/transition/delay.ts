import { get, init } from './schedule.ts'

function delayFunction(id: number, value: any): () => void {
  return function (this: any): void {
    init(this, id).delay = +value.apply(this, arguments)
  }
}

function delayConstant(id: number, value: any): () => void {
  return (value = +value, function (this: any): void {
    init(this, id).delay = value
  })
}

export default function (this: any, value?: any): any {
  const id = this._id

  return arguments.length
    ? this.each((typeof value === 'function'
        ? delayFunction
        : delayConstant)(id, value))
    : get(this.node(), id).delay
}
