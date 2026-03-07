export default function compose(a: any, b: any): any {
  function composed(x: number, y: number): any {
    const p = a(x, y)
    return b(p[0], p[1])
  }

  if (a.invert && b.invert) composed.invert = function (x: number, y: number): any {
    const p = b.invert(x, y)
    return p && a.invert(p[0], p[1])
  }

  return composed
}
