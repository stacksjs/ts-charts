import { slice } from './array.ts'
import bisect from './bisect.ts'
import constant from './constant.ts'
import extent from './extent.ts'
import identity from './identity.ts'
import nice from './nice.ts'
import ticks, { tickIncrement } from './ticks.ts'
import sturges from './threshold/sturges.ts'

export interface Bin<T> extends Array<T> {
  x0: number
  x1: number
}

export interface BinGenerator<T> {
  (data: Iterable<T>): Bin<T>[]
  value(): (d: T, i: number, data: T[]) => number
  // eslint-disable-next-line pickier/no-unused-vars
  value(value: number | ((d: T, i: number, data: T[]) => number)): BinGenerator<T>
  domain(): (values: number[]) => [number, number]
  // eslint-disable-next-line pickier/no-unused-vars
  domain(domain: [number, number] | ((values: number[]) => [number, number])): BinGenerator<T>
  thresholds(): (values: number[], x0: number, x1: number) => number[] | number
  // eslint-disable-next-line pickier/no-unused-vars
  thresholds(thresholds: number | number[] | ((values: number[], x0: number, x1: number) => number[] | number)): BinGenerator<T>
}

export default function bin(): BinGenerator<any> {
  let value: any = identity
  let domain: any = extent
  let threshold: any = sturges

  function histogram(data: any): any[] {
    if (!Array.isArray(data)) data = Array.from(data)

    let i: number
    const n = data.length
    let x: number
    let step: number | undefined
    const values = new Array(n)

    for (i = 0; i < n; ++i) {
      values[i] = value(data[i], i, data)
    }

    const xz = domain(values)
    let x0 = xz[0]
    let x1 = xz[1]
    let tz = threshold(values, x0, x1)

    // Convert number of thresholds into uniform thresholds, and nice the
    // default domain accordingly.
    if (!Array.isArray(tz)) {
      const max = x1, tn = +tz
      if (domain === extent) [x0, x1] = nice(x0, x1, tn)
      tz = ticks(x0, x1, tn)

      // If the domain is aligned with the first tick (which it will by
      // default), then we can use quantization rather than bisection to bin
      // values, which is substantially faster.
      if (tz[0] <= x0) step = tickIncrement(x0, x1, tn)

      // If the last threshold is coincident with the domain's upper bound, the
      // last bin will be zero-width. If the default domain is used, and this
      // last threshold is coincident with the maximum input value, we can
      // extend the niced upper bound by one tick to ensure uniform bin widths;
      // otherwise, we simply remove the last threshold. Note that we don't
      // coerce values or the domain to numbers, and thus must be careful to
      // compare order (>=) rather than strict equality (===)!
      if (tz[tz.length - 1] >= x1) {
        if (max >= x1 && domain === extent) {
          const step = tickIncrement(x0, x1, tn)
          if (isFinite(step)) {
            if (step > 0) {
              x1 = (Math.floor(x1 / step) + 1) * step
            }
            else if (step < 0) {
              x1 = (Math.ceil(x1 * -step) + 1) / -step
            }
          }
        }
        else {
          tz.pop()
        }
      }
    }

    // Remove any thresholds outside the domain.
    // Be careful not to mutate an array owned by the user!
    let m = tz.length, a = 0, b = m
    while (tz[a] <= x0) ++a
    while (tz[b - 1] > x1) --b
    if (a || b < m) tz = tz.slice(a, b), m = b - a

    const bins: Bin<unknown>[] = new Array(m + 1)
    let binItem: Bin<unknown>

    // Initialize bins.
    for (i = 0; i <= m; ++i) {
      binItem = bins[i] = [] as unknown as Bin<unknown>
      binItem.x0 = i > 0 ? tz[i - 1] : x0
      binItem.x1 = i < m ? tz[i] : x1
    }

    // Assign data to bins by value, ignoring any outside the domain.
    if (isFinite(step!)) {
      if (step! > 0) {
        for (i = 0; i < n; ++i) {
          if ((x = values[i]) != null && x0 <= x && x <= x1) {
            bins[Math.min(m, Math.floor((x - x0) / step!))].push(data[i])
          }
        }
      }
      else if (step! < 0) {
        for (i = 0; i < n; ++i) {
          if ((x = values[i]) != null && x0 <= x && x <= x1) {
            const j = Math.floor((x0 - x) * step!)
            bins[Math.min(m, j + (tz[j] <= x ? 1 : 0))].push(data[i])
          }
        }
      }
    }
    else {
      for (i = 0; i < n; ++i) {
        if ((x = values[i]) != null && x0 <= x && x <= x1) {
          bins[bisect(tz, x, 0, m)].push(data[i])
        }
      }
    }

    return bins
  }

  histogram.value = function(_?: any): any {
    return arguments.length ? (value = typeof _ === 'function' ? _ : constant(_), histogram) : value
  }

  histogram.domain = function(_?: any): any {
    return arguments.length ? (domain = typeof _ === 'function' ? _ : constant([_[0], _[1]]), histogram) : domain
  }

  histogram.thresholds = function(_?: any): any {
    return arguments.length ? (threshold = typeof _ === 'function' ? _ : constant(Array.isArray(_) ? slice.call(_) : _), histogram) : threshold
  }

  return histogram as any
}
