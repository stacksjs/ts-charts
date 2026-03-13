import { get, init } from './schedule.ts'

function delayFunction(id: number, value: Function): () => void {
  return function (this: Element): void {
    init(this, id).delay = +value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
  }
}

function delayConstant(id: number, value: number): () => void {
  return (value = +value, function (this: Element): void {
    init(this, id).delay = value
  })
}

// eslint-disable-next-line pickier/no-unused-vars
export default function (this: { _id: number; node: () => Element; each: Function }, value?: number | Function): unknown {
  const id = this._id

  return arguments.length
    ? this.each((typeof value === 'function'
        ? delayFunction
        : delayConstant)(id, value as number & Function))
    : get(this.node(), id).delay
}
