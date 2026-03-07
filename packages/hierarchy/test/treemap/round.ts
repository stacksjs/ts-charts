function r(x: number): number {
  return Math.round(x * 100) / 100
}

export function round(d: { x0?: number, y0?: number, x1?: number, y1?: number }): { x0: number, y0: number, x1: number, y1: number } {
  return {
    x0: r(d.x0!),
    y0: r(d.y0!),
    x1: r(d.x1!),
    y1: r(d.y1!),
  }
}
