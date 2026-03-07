import { tweenValue } from './tween.ts'

function textConstant(value: string): () => void {
  return function (this: any): void {
    this.textContent = value
  }
}

function textFunction(value: any): () => void {
  return function (this: any): void {
    const value1 = value(this)
    this.textContent = value1 == null ? '' : value1
  }
}

export default function (this: any, value: any): any {
  return this.tween('text', typeof value === 'function'
    ? textFunction(tweenValue(this, 'text', value))
    : textConstant(value == null ? '' : value + ''))
}
