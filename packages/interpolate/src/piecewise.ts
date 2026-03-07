import { default as value } from './value.ts'

export default function piecewise(interpolate: any, values?: any[]): (t: number) => any {
  if (values === undefined) { values = interpolate; interpolate = value }
  let i = 0
  const n = (values as any[]).length - 1
  let v = (values as any[])[0]
  const I = new Array(n < 0 ? 0 : n)
  while (i < n) I[i] = interpolate(v, v = (values as any[])[++i])
  return function (t: number): any {
    const i = Math.max(0, Math.min(n - 1, Math.floor(t *= n)))
    return I[i](t - i)
  }
}
