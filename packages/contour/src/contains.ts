export default function contains(ring: number[][], hole: number[][]): number {
  let i = -1
  const n = hole.length
  let c: number
  while (++i < n) if (c = ringContains(ring, hole[i])) return c
  return 0
}

function ringContains(ring: number[][], point: number[]): number {
  const x = point[0]
  const y = point[1]
  let contains = -1
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    const pi = ring[i], xi = pi[0], yi = pi[1], pj = ring[j], xj = pj[0], yj = pj[1]
    if (segmentContains(pi, pj, point)) return 0
    if (((yi > y) !== (yj > y)) && ((x < (xj - xi) * (y - yi) / (yj - yi) + xi))) contains = -contains
  }
  return contains
}

function segmentContains(a: number[], b: number[], c: number[]): boolean {
  let i: number
  return collinear(a, b, c) && within(a[i = +(a[0] === b[0])], c[i], b[i])
}

function collinear(a: number[], b: number[], c: number[]): boolean {
  return (b[0] - a[0]) * (c[1] - a[1]) === (c[0] - a[0]) * (b[1] - a[1])
}

function within(p: number, q: number, r: number): boolean {
  return p <= q && q <= r || r <= q && q <= p
}
