function styleInterpolate(name: string, i: any, priority: string): (t: number) => void {
  return function (this: any, t: number): void {
    this.style.setProperty(name, i.call(this, t), priority)
  }
}

function styleTween(name: string, value: any, priority: string): any {
  let t: any, i0: any
  function tween(this: any): any {
    const i = value.apply(this, arguments)
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority)
    return t
  }
  tween._value = value
  return tween
}

export default function (this: any, name: any, value?: any, priority?: any): any {
  const key = 'style.' + (name += '')
  if (arguments.length < 2) return (value = this.tween(key)) && value._value
  if (value == null) return this.tween(key, null)
  if (typeof value !== 'function') throw new Error()
  return this.tween(key, styleTween(name, value, priority == null ? '' : priority))
}
