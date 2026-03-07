export default function interpolateDiscrete<T>(range: T[]): (t: number) => T {
  const n = range.length
  return function (t: number): T {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))]
  }
}
