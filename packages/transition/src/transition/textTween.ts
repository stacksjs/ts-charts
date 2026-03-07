function textInterpolate(i: any): (t: number) => void {
  return function (this: any, t: number): void {
    this.textContent = i.call(this, t)
  }
}

function textTween(value: any): any {
  let t0: any, i0: any
  function tween(this: any): any {
    const i = value.apply(this, arguments)
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i)
    return t0
  }
  tween._value = value
  return tween
}

export default function (this: any, value?: any): any {
  const key = 'text'
  if (arguments.length < 1) return (value = this.tween(key)) && value._value
  if (value == null) return this.tween(key, null)
  if (typeof value !== 'function') throw new Error()
  return this.tween(key, textTween(value))
}
