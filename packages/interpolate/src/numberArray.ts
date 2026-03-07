export default function interpolateNumberArray(a: ArrayLike<number> | undefined, b: ArrayLike<number> | undefined): (t: number) => any {
  if (!b) b = []
  const n = a ? Math.min(b.length, a.length) : 0
  const c = (b as any).slice ? (b as any).slice() : Array.prototype.slice.call(b)
  let i: number
  return function (t: number): any {
    for (i = 0; i < n; ++i) c[i] = (a as ArrayLike<number>)[i] * (1 - t) + (b as ArrayLike<number>)[i] * t
    return c
  }
}

export function isNumberArray(x: unknown): boolean {
  return ArrayBuffer.isView(x) && !(x instanceof DataView)
}
