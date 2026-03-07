export function basis(t1: number, v0: number, v1: number, v2: number, v3: number): number {
  const t2 = t1 * t1
  const t3 = t2 * t1
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6
}

export default function interpolateBasis(values: number[]): (t: number) => number {
  const n = values.length - 1
  return function (t: number): number {
    const i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n)
    const v1 = values[i]
    const v2 = values[i + 1]
    const v0 = i > 0 ? values[i - 1] : 2 * v1 - v2
    const v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1
    return basis((t - i / n) * n, v0, v1, v2, v3)
  }
}
