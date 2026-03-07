import { interpolateTransformCss as interpolateTransform } from '@ts-charts/interpolate'
import { style } from '@ts-charts/selection'
import { set } from './schedule.ts'
import { tweenValue } from './tween.ts'
import interpolate from './interpolate.ts'

function styleNull(name: string, interpolateFn: any): () => any {
  let string00: string
  let string10: string
  let interpolate0: any
  return function (this: any): any {
    const string0 = style(this, name)
    const string1 = (this.style.removeProperty(name), style(this, name))
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, string10 = string1)
  }
}

function styleRemove(name: string): () => void {
  return function (this: any): void {
    this.style.removeProperty(name)
  }
}

function styleConstant(name: string, interpolateFn: any, value1: any): () => any {
  let string00: string
  const string1 = value1 + ''
  let interpolate0: any
  return function (this: any): any {
    const string0 = style(this, name)
    return string0 === string1 ? null
      : string0 === string00 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, value1)
  }
}

function styleFunction(name: string, interpolateFn: any, value: any): () => any {
  let string00: string
  let string10: string
  let interpolate0: any
  return function (this: any): any {
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
  let on0: any, on1: any, listener0: any
  const key = 'style.' + name
  const event = 'end.' + key
  let remove: any
  return function (this: any): void {
    const schedule = set(this, id)
    const on = schedule.on
    const listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined

    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener)

    schedule.on = on1
  }
}

export default function (this: any, name: string, value?: any, priority?: string): any {
  const i = (name += '') === 'transform' ? interpolateTransform : interpolate
  return value == null ? this
      .styleTween(name, styleNull(name, i))
      .on('end.style.' + name, styleRemove(name))
    : typeof value === 'function' ? this
      .styleTween(name, styleFunction(name, i, tweenValue(this, 'style.' + name, value)))
      .each(styleMaybeRemove(this._id, name))
    : this
      .styleTween(name, styleConstant(name, i, value), priority)
      .on('end.style.' + name, null)
}
