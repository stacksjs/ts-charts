import array from './array.ts'
import constant from './constant.ts'
import descending from './descending.ts'
import identity from './identity.ts'
import { tau } from './math.ts'

export default function(): any {
  let value: any = identity
  let sortValues: any = descending
  let sort: any = null
  let startAngle: any = constant(0)
  let endAngle: any = constant(tau)
  let padAngle: any = constant(0)

  function pie(this: any, data: any): any {
    let i: number
    const n = (data = array(data)).length
    let j: number
    let k: number
    let sum = 0
    const index = new Array(n)
    const arcs = new Array(n)
    let a0 = +startAngle.apply(this, arguments)
    const da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0))
    let a1: number
    const p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments))
    const pa = p * (da < 0 ? -1 : 1)
    let v: number

    for (i = 0; i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v
      }
    }

    // Optionally sort the arcs by previously-computed values or by data.
    if (sortValues != null) index.sort(function (i: number, j: number): number { return sortValues(arcs[i], arcs[j]) })
    else if (sort != null) index.sort(function (i: number, j: number): number { return sort(data[i], data[j]) })

    // Compute the arcs! They are stored in the original data's order.
    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p,
      }
    }

    return arcs
  }

  pie.value = function (_?: any): any {
    return arguments.length ? (value = typeof _ === 'function' ? _ : constant(+_), pie) : value
  }

  pie.sortValues = function (_?: any): any {
    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues
  }

  pie.sort = function (_?: any): any {
    return arguments.length ? (sort = _, sortValues = null, pie) : sort
  }

  pie.startAngle = function (_?: any): any {
    return arguments.length ? (startAngle = typeof _ === 'function' ? _ : constant(+_), pie) : startAngle
  }

  pie.endAngle = function (_?: any): any {
    return arguments.length ? (endAngle = typeof _ === 'function' ? _ : constant(+_), pie) : endAngle
  }

  pie.padAngle = function (_?: any): any {
    return arguments.length ? (padAngle = typeof _ === 'function' ? _ : constant(+_), pie) : padAngle
  }

  return pie
}
