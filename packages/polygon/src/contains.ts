export default function polygonContains(polygon: [number, number][], point: [number, number]): boolean {
  const n = polygon.length
  let p = polygon[n - 1]
  const x = point[0]
  const y = point[1]
  let x0 = p[0]
  let y0 = p[1]
  let x1: number
  let y1: number
  let inside = false

  for (let i = 0; i < n; ++i) {
    p = polygon[i]
    x1 = p[0]
    y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1
    y0 = y1
  }

  return inside
}
