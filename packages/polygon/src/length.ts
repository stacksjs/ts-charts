export default function polygonLength(polygon: [number, number][]): number {
  let i = -1
  const n = polygon.length
  let b = polygon[n - 1]
  let xa: number
  let ya: number
  let xb = b[0]
  let yb = b[1]
  let perimeter = 0

  while (++i < n) {
    xa = xb
    ya = yb
    b = polygon[i]
    xb = b[0]
    yb = b[1]
    xa -= xb
    ya -= yb
    perimeter += Math.hypot(xa, ya)
  }

  return perimeter
}
