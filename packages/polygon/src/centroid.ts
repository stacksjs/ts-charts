export default function polygonCentroid(polygon: [number, number][]): [number, number] {
  let i = -1
  const n = polygon.length
  let x = 0
  let y = 0
  let a
  let b = polygon[n - 1]
  let c
  let k = 0

  while (++i < n) {
    a = b
    b = polygon[i]
    k += c = a[0] * b[1] - b[0] * a[1]
    x += (a[0] + b[0]) * c
    y += (a[1] + b[1]) * c
  }

  k *= 3
  return [x / k, y / k]
}
