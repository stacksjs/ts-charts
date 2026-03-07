export default function compose(a: any, b: any): any {
  function composed(x: number, y: number): any {
    return x = a(x, y), b(x[0], x[1])
  }

  if (a.invert && b.invert) composed.invert = function (x: number, y: number): any {
    return x = b.invert(x, y), x && a.invert(x[0], x[1])
  }

  return composed
}
