import { extent, nice, thresholdSturges, ticks } from '@ts-charts/array'
import { slice } from './array.ts'
import ascending from './ascending.ts'
import area from './area.ts'
import constant from './constant.ts'
import contains from './contains.ts'
import noop from './noop.ts'

const cases: number[][][][] = [
  [],
  [[[1.0, 1.5], [0.5, 1.0]]],
  [[[1.5, 1.0], [1.0, 1.5]]],
  [[[1.5, 1.0], [0.5, 1.0]]],
  [[[1.0, 0.5], [1.5, 1.0]]],
  [[[1.0, 1.5], [0.5, 1.0]], [[1.0, 0.5], [1.5, 1.0]]],
  [[[1.0, 0.5], [1.0, 1.5]]],
  [[[1.0, 0.5], [0.5, 1.0]]],
  [[[0.5, 1.0], [1.0, 0.5]]],
  [[[1.0, 1.5], [1.0, 0.5]]],
  [[[0.5, 1.0], [1.0, 0.5]], [[1.5, 1.0], [1.0, 1.5]]],
  [[[1.5, 1.0], [1.0, 0.5]]],
  [[[0.5, 1.0], [1.5, 1.0]]],
  [[[1.0, 1.5], [1.5, 1.0]]],
  [[[0.5, 1.0], [1.0, 1.5]]],
  []
]

export default function Contours(): any {
  let dx = 1
  let dy = 1
  let threshold: any = thresholdSturges
  let smooth: any = smoothLinear

  function contours(values: ArrayLike<number>): any[] {
    let tz = threshold(values)

    // Convert number of thresholds into uniform thresholds.
    if (!Array.isArray(tz)) {
      const e = extent(values as any, finite)
      tz = ticks(...nice(e[0] as number, e[1] as number, tz), tz)
      while (tz[tz.length - 1] >= (e[1] as number)) tz.pop()
      while (tz[1] < (e[0] as number)) tz.shift()
    } else {
      tz = tz.slice().sort(ascending)
    }

    return tz.map((value: number) => contour(values, value))
  }

  // Accumulate, smooth contour rings, assign holes to exterior rings.
  function contour(values: ArrayLike<number>, value: any): any {
    const v = value == null ? NaN : +value
    if (isNaN(v)) throw new Error(`invalid value: ${value}`)

    const polygons: number[][][][] = []
    const holes: number[][][] = []

    isorings(values, v, function (ring: number[][]) {
      smooth(ring, values, v)
      if (area(ring) > 0) polygons.push([ring])
      else holes.push(ring)
    })

    holes.forEach(function (hole) {
      for (let i = 0, n = polygons.length, polygon: number[][][]; i < n; ++i) {
        if (contains((polygon = polygons[i])[0], hole) !== -1) {
          polygon.push(hole)
          return
        }
      }
    })

    return {
      type: 'MultiPolygon',
      value: value,
      coordinates: polygons
    }
  }

  // Marching squares with isolines stitched into rings.
  function isorings(values: ArrayLike<number>, value: number, callback: (ring: number[][]) => void): void {
    const fragmentByStart: any = new Array()
    const fragmentByEnd: any = new Array()
    let x: number, y: number, t0: any, t1: any, t2: any, t3: any

    // Special case for the first row (y = -1, t2 = t3 = 0).
    x = y = -1
    t1 = above(values[0], value)
    cases[t1 << 1].forEach(stitch)
    while (++x < dx - 1) {
      t0 = t1
      t1 = above(values[x + 1], value)
      cases[t0 | t1 << 1].forEach(stitch)
    }
    cases[t1 << 0].forEach(stitch)

    // General case for the intermediate rows.
    while (++y < dy - 1) {
      x = -1
      t1 = above(values[y * dx + dx], value)
      t2 = above(values[y * dx], value)
      cases[t1 << 1 | t2 << 2].forEach(stitch)
      while (++x < dx - 1) {
        t0 = t1
        t1 = above(values[y * dx + dx + x + 1], value)
        t3 = t2
        t2 = above(values[y * dx + x + 1], value)
        cases[t0 | t1 << 1 | t2 << 2 | t3 << 3].forEach(stitch)
      }
      cases[t1 | t2 << 3].forEach(stitch)
    }

    // Special case for the last row (y = dy - 1, t0 = t1 = 0).
    x = -1
    t2 = (values as any)[y * dx] >= value
    cases[t2 << 2].forEach(stitch)
    while (++x < dx - 1) {
      t3 = t2
      t2 = above(values[y * dx + x + 1], value)
      cases[t2 << 2 | t3 << 3].forEach(stitch)
    }
    cases[t2 << 3].forEach(stitch)

    function stitch(line: number[][]): void {
      const start = [line[0][0] + x, line[0][1] + y]
      const end = [line[1][0] + x, line[1][1] + y]
      const startIndex = index(start)
      const endIndex = index(end)
      let f: any, g: any
      if (f = fragmentByEnd[startIndex]) {
        if (g = fragmentByStart[endIndex]) {
          delete fragmentByEnd[f.end]
          delete fragmentByStart[g.start]
          if (f === g) {
            f.ring.push(end)
            callback(f.ring)
          } else {
            fragmentByStart[f.start] = fragmentByEnd[g.end] = { start: f.start, end: g.end, ring: f.ring.concat(g.ring) }
          }
        } else {
          delete fragmentByEnd[f.end]
          f.ring.push(end)
          fragmentByEnd[f.end = endIndex] = f
        }
      } else if (f = fragmentByStart[endIndex]) {
        if (g = fragmentByEnd[startIndex]) {
          delete fragmentByStart[f.start]
          delete fragmentByEnd[g.end]
          if (f === g) {
            f.ring.push(end)
            callback(f.ring)
          } else {
            fragmentByStart[g.start] = fragmentByEnd[f.end] = { start: g.start, end: f.end, ring: g.ring.concat(f.ring) }
          }
        } else {
          delete fragmentByStart[f.start]
          f.ring.unshift(start)
          fragmentByStart[f.start = startIndex] = f
        }
      } else {
        fragmentByStart[startIndex] = fragmentByEnd[endIndex] = { start: startIndex, end: endIndex, ring: [start, end] }
      }
    }
  }

  function index(point: number[]): number {
    return point[0] * 2 + point[1] * (dx + 1) * 4
  }

  function smoothLinear(ring: number[][], values: ArrayLike<number>, value: number): void {
    ring.forEach(function (point: number[]) {
      const x = point[0]
      const y = point[1]
      const xt = x | 0
      const yt = y | 0
      const v1 = valid(values[yt * dx + xt])
      if (x > 0 && x < dx && xt === x) {
        point[0] = smooth1(x, valid(values[yt * dx + xt - 1]), v1, value)
      }
      if (y > 0 && y < dy && yt === y) {
        point[1] = smooth1(y, valid(values[(yt - 1) * dx + xt]), v1, value)
      }
    })
  }

  contours.contour = contour

  contours.size = function (_?: [number, number]): any {
    if (!arguments.length) return [dx, dy]
    const _0 = Math.floor(_![0]), _1 = Math.floor(_![1])
    if (!(_0 >= 0 && _1 >= 0)) throw new Error('invalid size')
    return dx = _0, dy = _1, contours
  }

  contours.thresholds = function (_?: any): any {
    return arguments.length ? (threshold = typeof _ === 'function' ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), contours) : threshold
  }

  contours.smooth = function (_?: boolean): any {
    return arguments.length ? (smooth = _ ? smoothLinear : noop, contours) : smooth === smoothLinear
  }

  return contours
}

// When computing the extent, ignore infinite values (as well as invalid ones).
function finite(x: number): number {
  return isFinite(x) ? x : NaN
}

// Is the (possibly invalid) x greater than or equal to the (known valid) value?
// Treat any invalid value as below negative infinity.
function above(x: any, value: number): any {
  return x == null ? false : +x >= value
}

// During smoothing, treat any invalid value as negative infinity.
function valid(v: any): number {
  return v == null || isNaN(v = +v) ? -Infinity : v
}

function smooth1(x: number, v0: number, v1: number, value: number): number {
  const a = value - v0
  const b = v1 - v0
  const d = isFinite(a) || isFinite(b) ? a / b : Math.sign(a) / Math.sign(b)
  return isNaN(d) ? x : x + d - 0.5
}
