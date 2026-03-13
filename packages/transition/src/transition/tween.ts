import { get, set, type TweenEntry } from './schedule.ts'

function tweenRemove(id: number, name: string): () => void {
  let tween0: TweenEntry[], tween1: TweenEntry[]
  return function (this: Element): void {
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
  let tween0: TweenEntry[], tween1: TweenEntry[]
  if (typeof value !== 'function') throw new Error()
  return function (this: Element): void {
    const schedule = set(this, id)
    const tween = schedule.tween

    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice()
      const t: TweenEntry = { name, value }
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

// eslint-disable-next-line pickier/no-unused-vars
export default function (this: { _id: number; node: () => Element; each: Function }, name: string, value?: Function | null): unknown {
  const id = this._id

  name += ''

  if (arguments.length < 2) {
    const tween = get(this.node(), id).tween
    for (let i = 0, n = tween.length, t: TweenEntry; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value
      }
    }
    return null
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value as Function))
}

// eslint-disable-next-line pickier/no-unused-vars
export function tweenValue(transition: { _id: number; each: Function }, name: string, value: Function): (node: Element) => unknown {
  const id = transition._id

  transition.each(function (this: Element): void {
    const schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments as unknown as [unknown, number, ArrayLike<Element | null>])
  })

  return function (node: Element): unknown {
    return get(node, id).value![name]
  }
}
