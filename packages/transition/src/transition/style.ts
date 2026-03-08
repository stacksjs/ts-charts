import { interpolateTransformCss as interpolateTransform } from '@ts-charts/interpolate'
import { style } from '@ts-charts/selection'
import { set } from './schedule.ts'
import { tweenValue } from './tween.ts'
import interpolate from './interpolate.ts'

type InterpolateFn = (a: string | number, b: string | number) => (t: number) => string | number

function styleNull(name: string, interpolateFn: InterpolateFn): () => ((t: number) => string | number) | null {
  let string00: string
  let string10: string
  let interpolate0: (t: number) => string | number
  return function (this: HTMLElement): ((t: number) => string | number) | null {
    const string0 = style(this, name)
    const string1 = (this.style.removeProperty(name), style(this, name))
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, string10 = string1)
  }
}

function styleRemove(name: string): () => void {
  return function (this: HTMLElement): void {
    this.style.removeProperty(name)
  }
}

function styleConstant(name: string, interpolateFn: InterpolateFn, value1: string | number): () => ((t: number) => string | number) | null {
  let string00: string
  const string1 = value1 + ''
  let interpolate0: (t: number) => string | number
  return function (this: Element): ((t: number) => string | number) | null {
    const string0 = style(this, name)
    return string0 === string1 ? null
      : string0 === string00 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, value1)
  }
}

function styleFunction(name: string, interpolateFn: InterpolateFn, value: (node: Element) => string | number | null): () => ((t: number) => string | number) | null | void {
  let string00: string
  let string10: string
  let interpolate0: (t: number) => string | number
  return function (this: HTMLElement): ((t: number) => string | number) | null | void {
    const string0 = style(this, name)
    let value1 = value(this)
    let string1 = value1 + ''
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), style(this, name))
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : (string10 = string1, interpolate0 = interpolateFn(string00 = string0, value1))
  }
}

function styleMaybeRemove(id: number, name: string): () => void {
  let on0: unknown, on1: { on: Function; copy: () => { on: Function } }, listener0: (() => void) | undefined
  const key = 'style.' + name
  const event = 'end.' + key
  let remove: () => void
  return function (this: Element): void {
    const schedule = set(this, id)
    const on = schedule.on
    const listener = schedule.value![key] == null ? remove || (remove = styleRemove(name)) : undefined

    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on as unknown as { copy: () => { on: Function } }).copy() as { on: Function; copy: () => { on: Function } }).on(event, listener0 = listener)

    schedule.on = on1 as unknown as typeof schedule.on
  }
}

export default function (this: { _id: number; styleTween: Function; on: Function; each: Function }, name: string, value?: unknown, priority?: string): unknown {
  const i = (name += '') === 'transform' ? interpolateTransform as unknown as InterpolateFn : interpolate as InterpolateFn
  return value == null ? this
      .styleTween(name, styleNull(name, i))
      .on('end.style.' + name, styleRemove(name))
    : typeof value === 'function' ? this
      .styleTween(name, styleFunction(name, i, tweenValue(this, 'style.' + name, value as Function) as (node: Element) => string | number | null))
      .each(styleMaybeRemove(this._id, name))
    : this
      .styleTween(name, styleConstant(name, i, value as string | number), priority)
      .on('end.style.' + name, null)
}
