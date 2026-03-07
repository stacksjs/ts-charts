import { namespace } from '@ts-charts/selection'

function attrInterpolate(name: string, i: any): (t: number) => void {
  return function (this: any, t: number): void {
    this.setAttribute(name, i.call(this, t))
  }
}

function attrInterpolateNS(fullname: any, i: any): (t: number) => void {
  return function (this: any, t: number): void {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t))
  }
}

function attrTweenNS(fullname: any, value: any): any {
  let t0: any, i0: any
  function tween(this: any): any {
    const i = value.apply(this, arguments)
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i)
    return t0
  }
  tween._value = value
  return tween
}

function attrTween(name: string, value: any): any {
  let t0: any, i0: any
  function tween(this: any): any {
    const i = value.apply(this, arguments)
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i)
    return t0
  }
  tween._value = value
  return tween
}

export default function (this: any, name: any, value?: any): any {
  const key = 'attr.' + name
  if (arguments.length < 2) return (value = this.tween(key)) && value._value
  if (value == null) return this.tween(key, null)
  if (typeof value !== 'function') throw new Error()
  const fullname = namespace(name) as any
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value))
}
