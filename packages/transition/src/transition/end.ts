import { set } from './schedule.ts'

export default function (this: any): Promise<void> {
  let on0: any, on1: any
  const that = this
  const id = that._id
  let size = that.size()
  return new Promise(function (resolve, reject) {
    const cancel = { value: reject }
    const end = { value: function (): void { if (--size === 0) resolve() } }

    that.each(function (this: any): void {
      const schedule = set(this, id)
      const on = schedule.on

      if (on !== on0) {
        on1 = (on0 = on).copy()
        on1._.cancel.push(cancel)
        on1._.interrupt.push(cancel)
        on1._.end.push(end)
      }

      schedule.on = on1
    })

    if (size === 0) resolve()
  })
}
