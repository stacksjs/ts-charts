export default function interpolateNumberArray(a: ArrayLike<number> | undefined, b: ArrayLike<number> | undefined): (t: number) => ArrayLike<number> {
  if (!b) b = []
  const n = a ? Math.min(b.length, a.length) : 0
  // Preserve typed array type (Float64Array, Float32Array, etc.) — use slice for regular arrays
  const c: ArrayLike<number> & Record<number, number> = ArrayBuffer.isView(b)
    // eslint-disable-next-line pickier/no-unused-vars
    ? new ((b as object).constructor as new (source: ArrayLike<number>) => ArrayLike<number> & Record<number, number>)(b)
    : Array.prototype.slice.call(b) as number[]
  let i: number
  return function (t: number): ArrayLike<number> {
    for (i = 0; i < n; ++i) c[i] = (a as ArrayLike<number>)[i] * (1 - t) + (b as ArrayLike<number>)[i] * t
    return c
  }
}

export function isNumberArray(x: unknown): boolean {
  return ArrayBuffer.isView(x) && !(x instanceof DataView)
}
