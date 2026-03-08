import { interpolateTransformSvg as interpolateTransform } from '@ts-charts/interpolate'
import { namespace, type NamespaceLocal } from '@ts-charts/selection'
import { tweenValue } from './tween.ts'
import interpolate from './interpolate.ts'

type InterpolateFn = (a: string | number, b: string | number) => (t: number) => string | number

function attrRemove(name: string): () => void {
  return function (this: Element): void {
    this.removeAttribute(name)
  }
}

function attrRemoveNS(fullname: NamespaceLocal): () => void {
  return function (this: Element): void {
    this.removeAttributeNS(fullname.space, fullname.local)
  }
}

function attrConstant(name: string, interpolateFn: InterpolateFn, value1: string | number): () => ((t: number) => string | number) | null {
  let string00: string
  const string1 = value1 + ''
  let interpolate0: (t: number) => string | number
  return function (this: Element): ((t: number) => string | number) | null {
    const string0 = this.getAttribute(name)!
    return string0 === string1 ? null
      : string0 === string00 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, value1)
  }
}

function attrConstantNS(fullname: NamespaceLocal, interpolateFn: InterpolateFn, value1: string | number): () => ((t: number) => string | number) | null {
  let string00: string
  const string1 = value1 + ''
  let interpolate0: (t: number) => string | number
  return function (this: Element): ((t: number) => string | number) | null {
    const string0 = this.getAttributeNS(fullname.space, fullname.local)!
    return string0 === string1 ? null
      : string0 === string00 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, value1)
  }
}

function attrFunction(name: string, interpolateFn: InterpolateFn, value: (node: Element) => string | number | null): () => ((t: number) => string | number) | null | void {
  let string00: string
  let string10: string
  let interpolate0: (t: number) => string | number
  return function (this: Element): ((t: number) => string | number) | null | void {
    let string0: string
    const value1 = value(this)
    let string1: string
    if (value1 == null) return void this.removeAttribute(name)
    string0 = this.getAttribute(name)!
    string1 = value1 + ''
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : (string10 = string1, interpolate0 = interpolateFn(string00 = string0, value1))
  }
}

function attrFunctionNS(fullname: NamespaceLocal, interpolateFn: InterpolateFn, value: (node: Element) => string | number | null): () => ((t: number) => string | number) | null | void {
  let string00: string
  let string10: string
  let interpolate0: (t: number) => string | number
  return function (this: Element): ((t: number) => string | number) | null | void {
    let string0: string
    const value1 = value(this)
    let string1: string
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local)
    string0 = this.getAttributeNS(fullname.space, fullname.local)!
    string1 = value1 + ''
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : (string10 = string1, interpolate0 = interpolateFn(string00 = string0, value1))
  }
}

export default function (this: { _id: number; attrTween: Function; each: Function }, name: string, value: unknown): unknown {
  const fullname = namespace(name)
  const i = (fullname === 'transform' ? interpolateTransform : interpolate) as unknown as InterpolateFn
  return (this as unknown as { attrTween: Function }).attrTween(name, typeof value === 'function'
    ? ((typeof fullname === 'object' && fullname.local) ? attrFunctionNS : attrFunction)(fullname as NamespaceLocal & string, i, tweenValue(this, 'attr.' + name, value as Function) as (node: Element) => string | number | null)
    : value == null ? ((typeof fullname === 'object' && fullname.local) ? attrRemoveNS : attrRemove)(fullname as NamespaceLocal & string)
    : ((typeof fullname === 'object' && fullname.local) ? attrConstantNS : attrConstant)(fullname as NamespaceLocal & string, i, value as string | number))
}
