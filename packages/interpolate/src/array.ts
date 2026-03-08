import value from './value.ts'
import numberArray, { isNumberArray } from './numberArray.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts arrays, typed arrays, array-like objects, and undefined
export default function interpolateArray(a: any, b: any): (t: number) => unknown[] {
  return (isNumberArray(b) ? numberArray : genericArray)(a, b) as (t: number) => unknown[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts arrays, typed arrays, array-like objects, and undefined
export function genericArray(a: any, b: any): (t: number) => unknown[] {
  const nb = b ? b.length : 0
  const na = a ? Math.min(nb, a.length) : 0
  const x = new Array(na)
  const c = new Array(nb)
  let i: number

  for (i = 0; i < na; ++i) x[i] = value(a[i], b[i])
  for (; i < nb; ++i) c[i] = b[i]

  return function (t: number): unknown[] {
    for (i = 0; i < na; ++i) c[i] = x[i](t)
    return c
  }
}
