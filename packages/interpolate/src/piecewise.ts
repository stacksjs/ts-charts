import { default as value } from './value.ts'

// eslint-disable-next-line pickier/no-unused-vars
type Interpolator = (a: unknown, b: unknown) => (t: number) => unknown

export default function piecewise(interpolate: Interpolator | unknown[], values?: unknown[]): (t: number) => unknown {
  // eslint-disable-next-line pickier/no-unused-vars
  if (values === undefined) {
    values = interpolate as unknown[]
    interpolate = value
  }
  let i = 0
  const n = values.length - 1
  let v = values[0]
  const I = new Array(n < 0 ? 0 : n)
  while (i < n) I[i] = (interpolate as Interpolator)(v, v = values[++i])
  return function (t: number): unknown {
    const i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)))
    return I[i](t - i)
  }
}
