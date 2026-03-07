import clipBuffer from './buffer.ts'
import clipRejoin from './rejoin.ts'
import { epsilon, halfPi } from '../math.ts'
import polygonContains from '../polygonContains.ts'
import { merge } from '@ts-charts/array'

export default function clip(pointVisible: any, clipLine: any, interpolate: any, start: any): (sink: any) => any {
  return function (sink: any): any {
    const line = clipLine(sink),
        ringBuffer = clipBuffer(),
        ringSink = clipLine(ringBuffer)
    let polygonStarted = false,
        polygon: any,
        segments: any,
        ring: any

    const clipObj: any = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function (): void {
        clipObj.point = pointRing
        clipObj.lineStart = ringStart
        clipObj.lineEnd = ringEnd
        segments = []
        polygon = []
      },
      polygonEnd: function (): void {
        clipObj.point = point
        clipObj.lineStart = lineStart
        clipObj.lineEnd = lineEnd
        segments = merge(segments)
        const startInside = polygonContains(polygon, start)
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true
          clipRejoin(segments, compareIntersection, startInside, interpolate, sink)
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true
          sink.lineStart()
          interpolate(null, null, 1, sink)
          sink.lineEnd()
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false
        segments = polygon = null
      },
      sphere: function (): void {
        sink.polygonStart()
        sink.lineStart()
        interpolate(null, null, 1, sink)
        sink.lineEnd()
        sink.polygonEnd()
      }
    }

    function point(lambda: number, phi: number): void {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi)
    }

    function pointLine(lambda: number, phi: number): void {
      line.point(lambda, phi)
    }

    function lineStart(): void {
      clipObj.point = pointLine
      line.lineStart()
    }

    function lineEnd(): void {
      clipObj.point = point
      line.lineEnd()
    }

    function pointRing(lambda: number, phi: number): void {
      ring.push([lambda, phi])
      ringSink.point(lambda, phi)
    }

    function ringStart(): void {
      ringSink.lineStart()
      ring = []
    }

    function ringEnd(): void {
      pointRing(ring[0][0], ring[0][1])
      ringSink.lineEnd()

      const clean = ringSink.clean(),
          ringSegments = ringBuffer.result()
      let i: number, n = ringSegments.length, m: number,
          segment: any,
          pt: any

      ring.pop()
      polygon.push(ring)
      ring = null

      if (!n) return

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0]
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true
          sink.lineStart()
          for (i = 0; i < m; ++i) sink.point((pt = segment[i])[0], pt[1])
          sink.lineEnd()
        }
        return
      }

      // Rejoin connected segments.
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()))

      segments.push(ringSegments.filter(validSegment))
    }

    return clipObj
  }
}

function validSegment(segment: any): boolean {
  return segment.length > 1
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a: any, b: any): number {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1])
}
