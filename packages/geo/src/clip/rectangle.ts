import { abs, epsilon } from '../math.ts'
import clipBuffer from './buffer.ts'
import clipLine from './line.ts'
import clipRejoin from './rejoin.ts'
import { merge } from '@ts-charts/array'
import type { GeoStream, GeoStreamFactory } from '../types.ts'

const clipMax = 1e9, clipMin = -clipMax

export default function clipRectangle(x0: number, y0: number, x1: number, y1: number): GeoStreamFactory {

  function visible(x: number, y: number): boolean {
    return x0 <= x && x <= x1 && y0 <= y && y <= y1
  }

  function interpolate(from: number[] | null, to: number[] | null, direction: number, stream: GeoStream): void {
    let a = 0, a1 = 0
    if (from == null
        || (a = corner(from, direction)) !== (a1 = corner(to!, direction))
        || comparePoint(from, to!) < 0 !== direction > 0) {
      do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0)
      while ((a = (a + direction + 4) % 4) !== a1)
    }
    else {
      stream.point(to![0], to![1])
    }
  }

  function corner(p: number[], direction: number): number {
    return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
        : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
        : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
        : direction > 0 ? 3 : 2
  }

  function compareIntersection(a: { x: number[] }, b: { x: number[] }): number {
    return comparePoint(a.x, b.x)
  }

  function comparePoint(a: number[], b: number[]): number {
    const ca = corner(a, 1),
        cb = corner(b, 1)
    return ca !== cb ? ca - cb
        : ca === 0 ? b[1] - a[1]
        : ca === 1 ? a[0] - b[0]
        : ca === 2 ? a[1] - b[1]
        : b[0] - a[0]
  }

  return function (stream: GeoStream): GeoStream {
    let activeStream = stream,
        bufferStream = clipBuffer(),
        segments: number[][][][],
        polygon: number[][][],
        ring: number[][],
        x__: number, y__: number, v__: boolean,
        x_: number, y_: number, v_: boolean,
        first: boolean,
        clean: boolean

    const clipStream: GeoStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: polygonStart,
      polygonEnd: polygonEnd
    }

    function point(x: number, y: number): void {
      if (visible(x, y)) activeStream.point(x, y)
    }

    function polygonInside(): number {
      let winding = 0

      for (let i = 0, n = polygon.length; i < n; ++i) {
        for (let ringI = polygon[i], j = 1, m = ringI.length, pointI = ringI[0], a0: number, a1: number, b0 = pointI[0], b1 = pointI[1]; j < m; ++j) {
          a0 = b0, a1 = b1, pointI = ringI[j], b0 = pointI[0], b1 = pointI[1]
          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding }
          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding }
        }
      }

      return winding
    }

    function polygonStart(): void {
      activeStream = bufferStream, segments = [], polygon = [], clean = true
    }

    function polygonEnd(): void {
      const startInside = polygonInside(),
          cleanInside = clean && startInside,
          visibleSegments = (segments = merge(segments) as unknown as number[][][][]).length
      if (cleanInside || visibleSegments) {
        stream.polygonStart()
        if (cleanInside) {
          stream.lineStart()
          interpolate(null, null, 1, stream)
          stream.lineEnd()
        }
        if (visibleSegments) {
          clipRejoin(segments as unknown as number[][][], compareIntersection, startInside, interpolate, stream)
        }
        stream.polygonEnd()
      }
      activeStream = stream, segments = polygon = ring = null!
    }

    function lineStart(): void {
      clipStream.point = linePoint
      if (polygon) polygon.push(ring = [])
      first = true
      v_ = false
      x_ = y_ = NaN
    }

    function lineEnd(): void {
      if (segments) {
        linePoint(x__, y__)
        if (v__ && v_) bufferStream.rejoin()
        segments.push(bufferStream.result())
      }
      clipStream.point = point
      if (v_) activeStream.lineEnd()
    }

    function linePoint(x: number, y: number): void {
      const v = visible(x, y)
      if (polygon) ring.push([x, y])
      if (first) {
        x__ = x, y__ = y, v__ = v
        first = false
        if (v) {
          activeStream.lineStart()
          activeStream.point(x, y)
        }
      }
      else {
        if (v && v_) activeStream.point(x, y)
        else {
          const a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))]
          if (clipLine(a, b, x0, y0, x1, y1)) {
            if (!v_) {
              activeStream.lineStart()
              activeStream.point(a[0], a[1])
            }
            activeStream.point(b[0], b[1])
            if (!v) activeStream.lineEnd()
            clean = false
          }
          else if (v) {
            activeStream.lineStart()
            activeStream.point(x, y)
            clean = false
          }
        }
      }
      x_ = x, y_ = y, v_ = v
    }

    return clipStream
  }
}
