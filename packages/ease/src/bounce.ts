const b1: number = 4 / 11
const b2: number = 6 / 11
const b3: number = 8 / 11
const b4: number = 3 / 4
const b5: number = 9 / 11
const b6: number = 10 / 11
const b7: number = 15 / 16
const b8: number = 21 / 22
const b9: number = 63 / 64
const b0: number = 1 / b1 / b1

export function bounceIn(t: number): number {
  return 1 - bounceOut(1 - t)
}

export function bounceOut(t: number): number {
  return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9
}

export function bounceInOut(t: number): number {
  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2
}
