export const epsilon: number = 1e-6
export const epsilon2: number = 1e-12
export const pi: number = Math.PI
export const halfPi: number = pi / 2
export const quarterPi: number = pi / 4
export const tau: number = pi * 2

export const degrees: number = 180 / pi
export const radians: number = pi / 180

export const abs: (x: number) => number = Math.abs
export const atan: (x: number) => number = Math.atan
export const atan2: (y: number, x: number) => number = Math.atan2
export const cos: (x: number) => number = Math.cos
export const ceil: (x: number) => number = Math.ceil
export const exp: (x: number) => number = Math.exp
export const floor: (x: number) => number = Math.floor
export const hypot: (...values: number[]) => number = Math.hypot
export const log: (x: number) => number = Math.log
export const pow: (x: number, y: number) => number = Math.pow
export const sin: (x: number) => number = Math.sin
export const sign: (x: number) => number = Math.sign || function (x: number): number { return x > 0 ? 1 : x < 0 ? -1 : 0 }
export const sqrt: (x: number) => number = Math.sqrt
export const tan: (x: number) => number = Math.tan

export function acos(x: number): number {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x)
}

export function asin(x: number): number {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x)
}

export function haversin(x: number): number {
  return (x = sin(x / 2)) * x
}
