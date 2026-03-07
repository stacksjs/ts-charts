export default function area(ring: number[][]): number {
  let i = 0
  const n = ring.length
  let a = ring[n - 1][1] * ring[0][0] - ring[n - 1][0] * ring[0][1]
  while (++i < n) a += ring[i - 1][1] * ring[i][0] - ring[i - 1][0] * ring[i][1]
  return a
}
