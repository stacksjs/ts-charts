import { namespace, type NamespaceLocal } from '@ts-charts/selection'

type InterpolatorFactory = (this: Element, ...args: unknown[]) => (t: number) => string

interface TweenFn {
  (this: Element): ((t: number) => void) | undefined
  _value: InterpolatorFactory
}

function attrInterpolate(name: string, i: (t: number) => string): (t: number) => void {
  return function (this: Element, t: number): void {
    this.setAttribute(name, i.call(this, t))
  }
}

function attrInterpolateNS(fullname: NamespaceLocal, i: (t: number) => string): (t: number) => void {
  return function (this: Element, t: number): void {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t))
  }
}

function attrTweenNS(fullname: NamespaceLocal, value: InterpolatorFactory): TweenFn {
  let t0: ((t: number) => void) | undefined
  let i0: ((t: number) => string) | undefined
  function tween(this: Element): ((t: number) => void) | undefined {
    const i = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i)
    return t0
  }
  tween._value = value
  return tween
}

function attrTween(name: string, value: InterpolatorFactory): TweenFn {
  let t0: ((t: number) => void) | undefined
  let i0: ((t: number) => string) | undefined
  function tween(this: Element): ((t: number) => void) | undefined {
    const i = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i)
    return t0
  }
  tween._value = value
  return tween
}

export default function (this: { tween: Function }, name: string, value?: InterpolatorFactory | null): unknown {
  const key = 'attr.' + name
  if (arguments.length < 2) { const t = this.tween(key) as TweenFn | null; return t && t._value }
  if (value == null) return this.tween(key, null)
  if (typeof value !== 'function') throw new Error()
  const fullname = namespace(name)
  return this.tween(key, ((typeof fullname === 'object' && fullname.local) ? attrTweenNS : attrTween)(fullname as NamespaceLocal & string, value))
}
