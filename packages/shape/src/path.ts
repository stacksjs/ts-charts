import { Path } from '@ts-charts/path'

export function withPath(shape: any): () => Path {
  let digits: number | null = 3

  shape.digits = function (_?: number | null): any {
    if (!arguments.length) return digits
    if (_ == null) {
      digits = null
    } else {
      const d = Math.floor(_)
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`)
      digits = d
    }
    return shape
  }

  return (): Path => new Path(digits)
}
