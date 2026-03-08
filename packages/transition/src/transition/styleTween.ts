type InterpolatorFactory = (this: Element, ...args: unknown[]) => (t: number) => string

interface TweenFn {
  (this: Element): ((t: number) => void) | undefined
  _value: InterpolatorFactory
}

function styleInterpolate(name: string, i: (t: number) => string, priority: string): (t: number) => void {
  return function (this: HTMLElement, t: number): void {
    this.style.setProperty(name, i.call(this, t), priority)
  }
}

function styleTween(name: string, value: InterpolatorFactory, priority: string): TweenFn {
  let t: ((t: number) => void) | undefined
  let i0: ((t: number) => string) | undefined
  function tween(this: Element): ((t: number) => void) | undefined {
    const i = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority)
    return t
  }
  tween._value = value
  return tween
}

export default function (this: { tween: Function }, name: string, value?: InterpolatorFactory | null, priority?: string): unknown {
  const key = 'style.' + (name += '')
  if (arguments.length < 2) { const t = this.tween(key) as TweenFn | null; return t && t._value }
  if (value == null) return this.tween(key, null)
  if (typeof value !== 'function') throw new Error()
  return this.tween(key, styleTween(name, value, priority == null ? '' : priority))
}
