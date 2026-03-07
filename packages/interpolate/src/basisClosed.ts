import { basis } from './basis.ts'

export default function interpolateBasisClosed(values: number[]): (t: number) => number {
  const n = values.length
  return function (t: number): number {
    const i = Math.floor(((t %= 1) < 0 ? ++t : t) * n)
    const v0 = values[(i + n - 1) % n]
    const v1 = values[i % n]
    const v2 = values[(i + 1) % n]
    const v3 = values[(i + 2) % n]
    return basis((t - i / n) * n, v0, v1, v2, v3)
  }
}
