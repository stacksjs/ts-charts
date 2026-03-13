import constant from './constant.ts'

function linear(a: number, d: number): (t: number) => number {
  return function (t: number): number {
    return a + t * d
  }
}

function exponential(a: number, b: number, y: number): (t: number) => number {
  a = Math.pow(a, y)
  b = Math.pow(b, y) - a
  y = 1 / y
  return function (t: number): number {
    return Math.pow(a + t * b, y)
  }
}

export function hue(a: number, b: number): (t: number) => number {
  const d = b - a
  // eslint-disable-next-line pickier/no-unused-vars
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a) as (t: number) => number
}

export function gamma(y: number): (a: number, b: number) => (t: number) => number {
  return (y = +y) === 1 ? nogamma : function (a: number, b: number): (t: number) => number {
    // eslint-disable-next-line pickier/no-unused-vars
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a) as (t: number) => number
  }
}

export default function nogamma(a: number, b: number): (t: number) => number {
  const d = b - a
  // eslint-disable-next-line pickier/no-unused-vars
  return d ? linear(a, d) : constant(isNaN(a) ? b : a) as (t: number) => number
}
