import { get, set } from './schedule.ts'

function tweenRemove(id: number, name: string): () => void {
  let tween0: any, tween1: any
  return function (this: any): void {
    const schedule = set(this, id)
    const tween = schedule.tween

    if (tween !== tween0) {
      tween1 = tween0 = tween
      for (let i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice()
          tween1.splice(i, 1)
          break
        }
      }
    }

    schedule.tween = tween1
  }
}

function tweenFunction(id: number, name: string, value: Function): () => void {
  let tween0: any, tween1: any
  if (typeof value !== 'function') throw new Error()
  return function (this: any): void {
    const schedule = set(this, id)
    const tween = schedule.tween

    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice()
      const t = { name, value }
      let i: number
      const n = tween1.length
      for (i = 0; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t
          break
        }
      }
      if (i === n) tween1.push(t)
    }

    schedule.tween = tween1
  }
}

export default function (this: any, name: any, value?: any): any {
  const id = this._id

  name += ''

  if (arguments.length < 2) {
    const tween = get(this.node(), id).tween
    for (let i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value
      }
    }
    return null
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value))
}

export function tweenValue(transition: any, name: string, value: Function): (node: any) => any {
  const id = transition._id

  transition.each(function (this: any): void {
    const schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments as any)
  })

  return function (node: any): any {
    return get(node, id).value[name]
  }
}
