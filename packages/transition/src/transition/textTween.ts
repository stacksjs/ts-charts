type InterpolatorFactory = (this: Element, ...args: unknown[]) => (t: number) => string

interface TweenFn {
  (this: Element): ((t: number) => void) | undefined
  _value: InterpolatorFactory
}

function textInterpolate(i: (t: number) => string): (t: number) => void {
  return function (this: Element, t: number): void {
    this.textContent = i.call(this, t)
  }
}

function textTween(value: InterpolatorFactory): TweenFn {
  let t0: ((t: number) => void) | undefined
  let i0: ((t: number) => string) | undefined
  function tween(this: Element): ((t: number) => void) | undefined {
    const i = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i)
    return t0
  }
  tween._value = value
  return tween
}

export default function (this: { tween: Function }, value?: InterpolatorFactory | null): unknown {
  const key = 'text'
  if (arguments.length < 1) { const t = this.tween(key) as TweenFn | null; return t && t._value }
  if (value == null) return this.tween(key, null)
  if (typeof value !== 'function') throw new Error()
  return this.tween(key, textTween(value))
}
