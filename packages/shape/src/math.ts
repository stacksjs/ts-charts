export const abs: (x: number) => number = Math.abs
export const atan2: (y: number, x: number) => number = Math.atan2
export const cos: (x: number) => number = Math.cos
export const max: (...values: number[]) => number = Math.max
export const min: (...values: number[]) => number = Math.min
export const sin: (x: number) => number = Math.sin
export const sqrt: (x: number) => number = Math.sqrt

export const epsilon: number = 1e-12
export const pi: number = Math.PI
export const halfPi: number = pi / 2
export const tau: number = 2 * pi

export function acos(x: number): number {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x)
}

export function asin(x: number): number {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x)
}
