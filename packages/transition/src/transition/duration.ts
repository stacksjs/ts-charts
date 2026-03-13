import { get, set } from './schedule.ts'

function durationFunction(id: number, value: Function): () => void {
  return function (this: Element): void {
    set(this, id).duration = +value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
  }
}

function durationConstant(id: number, value: number): () => void {
  return (value = +value, function (this: Element): void {
    set(this, id).duration = value
  })
}

// eslint-disable-next-line pickier/no-unused-vars
export default function (this: { _id: number; node: () => Element; each: Function }, value?: number | Function): unknown {
  const id = this._id

  return arguments.length
    ? this.each((typeof value === 'function'
        ? durationFunction
        : durationConstant)(id, value as number & Function))
    : get(this.node(), id).duration
}
