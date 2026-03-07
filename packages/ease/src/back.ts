export interface BackEasingFn {
  (t: number): number
  overshoot(s: number): BackEasingFn
}

const overshoot: number = 1.70158

export const backIn: BackEasingFn = (function custom(s: number): BackEasingFn {
  s = +s

  function backIn(t: number): number {
    return (t = +t) * t * (s * (t - 1) + t)
  }

  backIn.overshoot = custom

  return backIn as BackEasingFn
})(overshoot)

export const backOut: BackEasingFn = (function custom(s: number): BackEasingFn {
  s = +s

  function backOut(t: number): number {
    return --t * t * ((t + 1) * s + t) + 1
  }

  backOut.overshoot = custom

  return backOut as BackEasingFn
})(overshoot)

export const backInOut: BackEasingFn = (function custom(s: number): BackEasingFn {
  s = +s

  function backInOut(t: number): number {
    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2
  }

  backInOut.overshoot = custom

  return backInOut as BackEasingFn
})(overshoot)
