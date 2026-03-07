export interface PolyEasingFn {
  (t: number): number
  exponent(e: number): PolyEasingFn
}

const exponent: number = 3

export const polyIn: PolyEasingFn = (function custom(e: number): PolyEasingFn {
  e = +e

  function polyIn(t: number): number {
    return Math.pow(t, e)
  }

  polyIn.exponent = custom

  return polyIn as PolyEasingFn
})(exponent)

export const polyOut: PolyEasingFn = (function custom(e: number): PolyEasingFn {
  e = +e

  function polyOut(t: number): number {
    return 1 - Math.pow(1 - t, e)
  }

  polyOut.exponent = custom

  return polyOut as PolyEasingFn
})(exponent)

export const polyInOut: PolyEasingFn = (function custom(e: number): PolyEasingFn {
  e = +e

  function polyInOut(t: number): number {
    return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2
  }

  polyInOut.exponent = custom

  return polyInOut as PolyEasingFn
})(exponent)
