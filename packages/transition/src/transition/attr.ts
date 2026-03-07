import { interpolateTransformSvg as interpolateTransform } from '@ts-charts/interpolate'
import { namespace } from '@ts-charts/selection'
import { tweenValue } from './tween.ts'
import interpolate from './interpolate.ts'

function attrRemove(name: string): () => void {
  return function (this: any): void {
    this.removeAttribute(name)
  }
}

function attrRemoveNS(fullname: any): () => void {
  return function (this: any): void {
    this.removeAttributeNS(fullname.space, fullname.local)
  }
}

function attrConstant(name: string, interpolateFn: any, value1: any): () => any {
  let string00: string
  const string1 = value1 + ''
  let interpolate0: any
  return function (this: any): any {
    const string0 = this.getAttribute(name)
    return string0 === string1 ? null
      : string0 === string00 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, value1)
  }
}

function attrConstantNS(fullname: any, interpolateFn: any, value1: any): () => any {
  let string00: string
  const string1 = value1 + ''
  let interpolate0: any
  return function (this: any): any {
    const string0 = this.getAttributeNS(fullname.space, fullname.local)
    return string0 === string1 ? null
      : string0 === string00 ? interpolate0
      : interpolate0 = interpolateFn(string00 = string0, value1)
  }
}

function attrFunction(name: string, interpolateFn: any, value: any): () => any {
  let string00: string
  let string10: string
  let interpolate0: any
  return function (this: any): any {
    let string0: string
    const value1 = value(this)
    let string1: string
    if (value1 == null) return void this.removeAttribute(name)
    string0 = this.getAttribute(name)
    string1 = value1 + ''
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : (string10 = string1, interpolate0 = interpolateFn(string00 = string0, value1))
  }
}

function attrFunctionNS(fullname: any, interpolateFn: any, value: any): () => any {
  let string00: string
  let string10: string
  let interpolate0: any
  return function (this: any): any {
    let string0: string
    const value1 = value(this)
    let string1: string
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local)
    string0 = this.getAttributeNS(fullname.space, fullname.local)
    string1 = value1 + ''
    return string0 === string1 ? null
      : string0 === string00 && string1 === string10 ? interpolate0
      : (string10 = string1, interpolate0 = interpolateFn(string00 = string0, value1))
  }
}

export default function (this: any, name: string, value: any): any {
  const fullname = namespace(name) as any
  const i = fullname === 'transform' ? interpolateTransform : interpolate
  return this.attrTween(name, typeof value === 'function'
    ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, 'attr.' + name, value))
    : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
    : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value))
}
