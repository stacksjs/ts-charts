import pointEqual from '../pointEqual.ts'
import { epsilon } from '../math.ts'

class Intersection {
  x: any
  z: any
  o: any
  e: boolean
  v: boolean
  n: Intersection | null
  p: Intersection | null

  constructor(point: any, points: any, other: any, entry: boolean) {
    this.x = point
    this.z = points
    this.o = other
    this.e = entry
    this.v = false
    this.n = this.p = null
  }
}

export default function clipRejoin(segments: any[], compareIntersection: any, startInside: any, interpolate: any, stream: any): void {
  const subject: Intersection[] = [],
      clip: Intersection[] = []
  let i: number,
      n: number

  segments.forEach(function (segment: any) {
    if ((n = segment.length - 1) <= 0) return
    let p0 = segment[0], p1 = segment[n], x: Intersection

    if (pointEqual(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart()
        for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1])
        stream.lineEnd()
        return
      }
      p1[0] += 2 * epsilon
    }

    subject.push(x = new Intersection(p0, segment, null, true))
    clip.push(x.o = new Intersection(p0, null, x, false))
    subject.push(x = new Intersection(p1, segment, null, false))
    clip.push(x.o = new Intersection(p1, null, x, true))
  })

  if (!subject.length) return

  clip.sort(compareIntersection)
  link(subject)
  link(clip)

  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside
  }

  const start = subject[0]
  let points: any,
      point: any

  while (1) {
    let current: any = start,
        isSubject = true
    while (current.v) if ((current = current.n) === start) return
    points = current.z
    stream.lineStart()
    do {
      current.v = current.o.v = true
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1])
        } else {
          interpolate(current.x, current.n.x, 1, stream)
        }
        current = current.n
      } else {
        if (isSubject) {
          points = current.p.z
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1])
        } else {
          interpolate(current.x, current.p.x, -1, stream)
        }
        current = current.p
      }
      current = current.o
      points = current.z
      isSubject = !isSubject
    } while (!current.v)
    stream.lineEnd()
  }
}

function link(array: Intersection[]): void {
  const n = array.length
  if (!n) return
  let i = 0,
      a = array[0],
      b: Intersection
  while (++i < n) {
    a.n = b = array[i]
    b.p = a
    a = b
  }
  a.n = b = array[0]
  b.p = a
}
