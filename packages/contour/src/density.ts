import { blur2, max, ticks } from '@ts-charts/array'
import { slice } from './array.ts'
import constant from './constant.ts'
import Contours from './contours.ts'

function defaultX(d: [number, number]): number {
  return d[0]
}

function defaultY(d: [number, number]): number {
  return d[1]
}

function defaultWeight(): number {
  return 1
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 getter/setter pattern
export default function contourDensity(): any {
  let x: (d: unknown, i: number, data: unknown) => number = defaultX as (d: unknown, i: number, data: unknown) => number
  let y: (d: unknown, i: number, data: unknown) => number = defaultY as (d: unknown, i: number, data: unknown) => number
  let weight: (d: unknown, i: number, data: unknown) => number = defaultWeight as unknown as (d: unknown, i: number, data: unknown) => number
  let dx = 960
  let dy = 500
  let r = 20 // blur radius
  let k = 2 // log2(grid cell size)
  // eslint-disable-next-line pickier/no-unused-vars
  let o = r * 3 // grid offset, to pad for blur
  let n = (dx + o * 2) >> k // grid width
  let m = (dy + o * 2) >> k // grid height
  let threshold: ((values: Float32Array) => number | number[]) = constant(20) as unknown as (values: Float32Array) => number

  function grid(data: Iterable<unknown>): Float32Array {
    const values = new Float32Array(n * m)
    const pow2k = Math.pow(2, -k)
    let i = -1

    for (const d of data) {
      const xi = (x(d, ++i, data) + o) * pow2k
      const yi = (y(d, i, data) + o) * pow2k
      const wi = +weight(d, i, data)
      if (wi && xi >= 0 && xi < n && yi >= 0 && yi < m) {
        const x0 = Math.floor(xi)
        const y0 = Math.floor(yi)
        const xt = xi - x0 - 0.5
        const yt = yi - y0 - 0.5
        values[x0 + y0 * n] += (1 - xt) * (1 - yt) * wi
        values[x0 + 1 + y0 * n] += xt * (1 - yt) * wi
        values[x0 + 1 + (y0 + 1) * n] += xt * yt * wi
        values[x0 + (y0 + 1) * n] += (1 - xt) * yt * wi
      }
    }

    blur2({ data: values as unknown as number[], width: n, height: m }, r * pow2k)
    return values
  }

  function density(data: Iterable<unknown>): any[] {
    const values = grid(data)
    let tz: number | number[] = threshold(values)
    const pow4k = Math.pow(2, 2 * k)

    // Convert number of thresholds into uniform thresholds.
    if (!Array.isArray(tz)) {
      tz = ticks(Number.MIN_VALUE, max(values)! / pow4k, tz as number)
    }

    return Contours()
        .size([n, m])
        .thresholds(tz.map((d: number) => d * pow4k))
      (values)
        .map((c: any, i: number) => (c.value = +tz[i], transform(c)))
  }

  density.contours = function (data: Iterable<unknown>): any {
    const values = grid(data)
    const contoursObj = Contours().size([n, m])
    const pow4k = Math.pow(2, 2 * k)
    const contour = (value: number): any => {
      value = +value
      const c = transform(contoursObj.contour(values, value * pow4k))
      c.value = value // preserve exact threshold value
      return c
    }
    Object.defineProperty(contour, 'max', { get: () => max(values)! / pow4k })
    return contour
  }

  function transform(geometry: any): any {
    geometry.coordinates.forEach(transformPolygon)
    return geometry
  }

  function transformPolygon(coordinates: number[][][]): void {
    coordinates.forEach(transformRing)
  }

  function transformRing(coordinates: number[][]): void {
    coordinates.forEach(transformPoint)
  }

  // TODO Optimize.
  function transformPoint(coordinates: number[]): void {
    coordinates[0] = coordinates[0] * Math.pow(2, k) - o
    coordinates[1] = coordinates[1] * Math.pow(2, k) - o
  }

  function resize(): typeof density {
    o = r * 3
    n = (dx + o * 2) >> k
    m = (dy + o * 2) >> k
    return density
  }

  density.x = function (_?: any): any {
    return arguments.length ? (x = typeof _ === 'function' ? _ : constant(+_), density) : x
  }

  density.y = function (_?: any): any {
    return arguments.length ? (y = typeof _ === 'function' ? _ : constant(+_), density) : y
  }

  density.weight = function (_?: any): any {
    return arguments.length ? (weight = typeof _ === 'function' ? _ : constant(+_), density) : weight
  }

  density.size = function (_?: [number, number]): any {
    if (!arguments.length) return [dx, dy]
    const _0 = +_![0], _1 = +_![1]
    if (!(_0 >= 0 && _1 >= 0)) throw new Error('invalid size')
    return dx = _0, dy = _1, resize()
  }

  density.cellSize = function (_?: number): any {
    if (!arguments.length) return 1 << k
    if (!((_ = +_!) >= 1)) throw new Error('invalid cell size')
    return k = Math.floor(Math.log(_) / Math.LN2), resize()
  }

  density.thresholds = function (_?: any): any {
    return arguments.length ? (threshold = typeof _ === 'function' ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), density) : threshold
  }

  density.bandwidth = function (_?: number): any {
    if (!arguments.length) return Math.sqrt(r * (r + 1))
    if (!((_ = +_!) >= 0)) throw new Error('invalid bandwidth')
    return r = (Math.sqrt(4 * _ * _ + 1) - 1) / 2, resize()
  }

  return density
}
