import { set } from './schedule.ts'
import type { Dispatch } from '@ts-charts/dispatch'

export default function (this: { _id: number; size: () => number; each: Function }): Promise<void> {
  let on0: Dispatch, on1: Dispatch & { _: Record<string, Array<{ value: Function }>> }
  const that = this
  const id = that._id
  let size = that.size()
  return new Promise(function (resolve, reject) {
    const cancel = { value: reject }
    const end = { value: function (): void { if (--size === 0) resolve() } }

    that.each(function (this: Element): void {
      const schedule = set(this, id)
      const on = schedule.on

      if (on !== on0) {
        on1 = (on0 = on).copy() as typeof on1
        on1._.cancel.push(cancel)
        on1._.interrupt.push(cancel)
        on1._.end.push(end)
      }

      schedule.on = on1
    })

    if (size === 0) resolve()
  })
}
