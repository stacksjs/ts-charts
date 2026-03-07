import ascending from './ascending.ts'
import descending from './descending.ts'

export interface BisectorResult<T, U> {
  left: (a: ArrayLike<T>, x: U, lo?: number, hi?: number) => number
  center: (a: ArrayLike<T>, x: U, lo?: number, hi?: number) => number
  right: (a: ArrayLike<T>, x: U, lo?: number, hi?: number) => number
}

export default function bisector<T, U>(f: ((a: T, b: U) => number) | ((d: T) => U)): BisectorResult<T, U> {
  let compare1: (a: any, b: any) => number
  let compare2: (d: any, x: any) => number
  let delta: (d: any, x: any) => number

  if ((f as Function).length !== 2) {
    compare1 = ascending
    compare2 = (d: any, x: any) => ascending((f as (d: T) => U)(d), x)
    delta = (d: any, x: any) => (f as any)(d) - x
  } else {
    compare1 = f === ascending || f === descending ? f as (a: any, b: any) => number : zero
    compare2 = f as (a: any, b: any) => number
    delta = f as (a: any, b: any) => number
  }

  function left(a: ArrayLike<T>, x: U, lo: number = 0, hi: number = a.length): number {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi
      do {
        const mid = (lo + hi) >>> 1
        if (compare2(a[mid], x) < 0) lo = mid + 1
        else hi = mid
      } while (lo < hi)
    }
    return lo
  }

  function right(a: ArrayLike<T>, x: U, lo: number = 0, hi: number = a.length): number {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi
      do {
        const mid = (lo + hi) >>> 1
        if (compare2(a[mid], x) <= 0) lo = mid + 1
        else hi = mid
      } while (lo < hi)
    }
    return lo
  }

  function center(a: ArrayLike<T>, x: U, lo: number = 0, hi: number = a.length): number {
    const i = left(a, x, lo, hi - 1)
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i
  }

  return { left, center, right }
}

function zero(): number {
  return 0
}
