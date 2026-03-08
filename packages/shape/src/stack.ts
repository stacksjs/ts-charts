import array from './array.ts'
import constant from './constant.ts'
import offsetNone from './offset/none.ts'
import orderNone from './order/none.ts'

function stackValue(d: Record<string, unknown>, key: string): unknown {
  return d[key]
}

function stackSeries(key: string): any {
  const series: any = []
  series.key = key
  return series
}

export default function(): any {
  let keys: any = constant([])
  let order: any = orderNone
  let offset: any = offsetNone
  let value: any = stackValue

  function stack(this: any, data: any): any {
    const sz = Array.from(keys.apply(this, arguments), stackSeries)
    let i: number
    const n = sz.length
    let j = -1
    let oz: any

    for (const d of data) {
      for (i = 0, ++j; i < n; ++i) {
        (sz[i][j] = [0, +value(d, sz[i].key, j, data)] as any).data = d
      }
    }

    for (i = 0, oz = array(order(sz)); i < n; ++i) {
      (sz as any)[oz[i]].index = i
    }

    offset(sz, oz)
    return sz
  }

  stack.keys = function (_?: any): any {
    return arguments.length ? (keys = typeof _ === 'function' ? _ : constant(Array.from(_)), stack) : keys
  }

  stack.value = function (_?: any): any {
    return arguments.length ? (value = typeof _ === 'function' ? _ : constant(+_), stack) : value
  }

  stack.order = function (_?: any): any {
    return arguments.length ? (order = _ == null ? orderNone : typeof _ === 'function' ? _ : constant(Array.from(_)), stack) : order
  }

  stack.offset = function (_?: any): any {
    return arguments.length ? (offset = _ == null ? offsetNone : _, stack) : offset
  }

  return stack
}
