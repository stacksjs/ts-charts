import { tweenValue } from './tween.ts'

function textConstant(value: string): () => void {
  return function (this: Element): void {
    this.textContent = value
  }
}

function textFunction(value: (node: Element) => string | null): () => void {
  return function (this: Element): void {
    const value1 = value(this)
    this.textContent = value1 == null ? '' : value1
  }
}

// eslint-disable-next-line pickier/no-unused-vars
export default function (this: { _id: number; tween: Function; each: Function }, value: unknown): unknown {
  return (this as unknown as { tween: Function }).tween('text', typeof value === 'function'
    // eslint-disable-next-line pickier/no-unused-vars
    ? textFunction(tweenValue(this, 'text', value as Function) as (node: Element) => string | null)
    // eslint-disable-next-line pickier/no-unused-vars
    : textConstant(value == null ? '' : value + ''))
}
