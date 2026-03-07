// https://github.com/python/cpython/blob/a74eea238f5baba15797e2e8b570d153bc8690a7/Modules/mathmodule.c#L1423
export class Adder {
  _partials: Float64Array
  _n: number

  constructor() {
    this._partials = new Float64Array(32)
    this._n = 0
  }

  add(x: number): this {
    const p = this._partials
    let i = 0
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j]
      const hi = x + y
      const lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x)
      if (lo) p[i++] = lo
      x = hi
    }
    p[i] = x
    this._n = i + 1
    return this
  }

  valueOf(): number {
    const p = this._partials
    let n = this._n, x: number, y: number, lo: number, hi = 0
    if (n > 0) {
      hi = p[--n]
      while (n > 0) {
        x = hi
        y = p[--n]
        hi = x + y
        lo = y - (hi - x)
        if (lo) break
      }
      if (n > 0 && ((lo! < 0 && p[n - 1] < 0) || (lo! > 0 && p[n - 1] > 0))) {
        y = lo! * 2
        x = hi + y
        if (y == x - hi) hi = x
      }
    }
    return hi
  }
}

export function fsum(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): number {
  const adder = new Adder()
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        adder.add(value)
      }
    }
  } else {
    let index = -1
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        adder.add(value)
      }
    }
  }
  return +adder
}

export function fcumsum(values: Iterable<any>, valueof?: (value: any, index: number, values: Iterable<any>) => any): Float64Array {
  const adder = new Adder()
  let index = -1
  return Float64Array.from(values as any, valueof === undefined
    ? (v: any) => adder.add(+v || 0)
    : (v: any) => adder.add(+valueof(v, ++index, values) || 0)
  )
}
