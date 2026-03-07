export function polygonContext(): any {
  return {
    points: null as [number, number][] | null,
    area(): number {
      return Math.abs(polygonArea(this.points!))
    },
    moveTo(x: number, y: number): void {
      this.points = [[x, y]]
    },
    lineTo(x: number, y: number): void {
      this.points!.push([x, y])
    },
    rect(x: number, y: number, w: number, h: number): void {
      this.points = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    },
    closePath(): void {},
  }
}

function polygonArea(polygon: [number, number][]): number {
  const n = polygon.length
  let i = -1
  let a: [number, number]
  let b = polygon[n - 1]
  let area = 0
  while (++i < n) {
    a = b
    b = polygon[i]
    area += a[1] * b[0] - a[0] * b[1]
  }
  return area / 2
}
