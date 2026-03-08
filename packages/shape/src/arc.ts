import constant from './constant.ts'
import { abs, acos, asin, atan2, cos, epsilon, halfPi, max, min, pi, sin, sqrt, tau } from './math.ts'
import { withPath } from './path.ts'

function arcInnerRadius(d: Record<string, unknown>): unknown {
  return d.innerRadius
}

function arcOuterRadius(d: Record<string, unknown>): unknown {
  return d.outerRadius
}

function arcStartAngle(d: Record<string, unknown>): unknown {
  return d.startAngle
}

function arcEndAngle(d: Record<string, unknown>): unknown {
  return d.endAngle
}

function arcPadAngle(d: Record<string, unknown>): unknown {
  return d && d.padAngle // Note: optional!
}

function intersect(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): [number, number] | undefined {
  const x10 = x1 - x0, y10 = y1 - y0,
    x32 = x3 - x2, y32 = y3 - y2
  let t = y32 * x10 - x32 * y10
  if (t * t < epsilon) return
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t
  return [x0 + t * x10, y0 + t * y10]
}

// Compute perpendicular offset line of length rc.
// http://mathworld.wolfram.com/Circle-LineIntersection.html
function cornerTangents(x0: number, y0: number, x1: number, y1: number, r1: number, rc: number, cw: boolean): { cx: number, cy: number, x01: number, y01: number, x11: number, y11: number } {
  const x01 = x0 - x1
  const y01 = y0 - y1
  const lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01)
  const ox = lo * y01
  const oy = -lo * x01
  const x11 = x0 + ox
  const y11 = y0 + oy
  const x10 = x1 + ox
  const y10 = y1 + oy
  const x00 = (x11 + x10) / 2
  const y00 = (y11 + y10) / 2
  const dx = x10 - x11
  const dy = y10 - y11
  const d2 = dx * dx + dy * dy
  const r = r1 - rc
  const D = x11 * y10 - x10 * y11
  const d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D))
  let cx0 = (D * dy - dx * d) / d2
  let cy0 = (-D * dx - dy * d) / d2
  const cx1 = (D * dy + dx * d) / d2
  const cy1 = (-D * dx + dy * d) / d2
  const dx0 = cx0 - x00
  const dy0 = cy0 - y00
  const dx1 = cx1 - x00
  const dy1 = cy1 - y00

  // Pick the closer of the two intersection points.
  // TODO Is there a faster way to determine which intersection to use?
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1

  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1),
  }
}

export default function(): any {
  let innerRadius: any = arcInnerRadius
  let outerRadius: any = arcOuterRadius
  let cornerRadius: any = constant(0)
  let padRadius: any = null
  let startAngle: any = arcStartAngle
  let endAngle: any = arcEndAngle
  let padAngle: any = arcPadAngle
  let context: any = null
  const path = withPath(arc)

  function arc(this: any): any {
    let buffer: ReturnType<typeof path> | undefined
    let r: number
    let r0 = +innerRadius.apply(this, arguments)
    let r1 = +outerRadius.apply(this, arguments)
    const a0 = startAngle.apply(this, arguments) - halfPi
    const a1 = endAngle.apply(this, arguments) - halfPi
    const da = abs(a1 - a0)
    const cw = a1 > a0

    if (!context) context = buffer = path()

    // Ensure that the outer radius is always larger than the inner radius.
    if (r1 < r0) r = r1, r1 = r0, r0 = r

    // Is it a point?
    if (!(r1 > epsilon)) context.moveTo(0, 0)

    // Or is it a circle or annulus?
    else if (da > tau - epsilon) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0))
      context.arc(0, 0, r1, a0, a1, !cw)
      if (r0 > epsilon) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1))
        context.arc(0, 0, r0, a1, a0, cw)
      }
    }

    // Or is it a circular or annular sector?
    else {
      let a01 = a0
      let a11 = a1
      let a00 = a0
      let a10 = a1
      let da0 = da
      let da1 = da
      const ap = padAngle.apply(this, arguments) / 2
      const rp = (ap > epsilon) ? (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)) : 0
      let rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))
      let rc0 = rc
      let rc1 = rc
      let t0: ReturnType<typeof cornerTangents>
      let t1: ReturnType<typeof cornerTangents>

      // Apply padding? Note that since r1 >= r0, da1 >= da0.
      if (rp > epsilon) {
        let p0 = asin(rp / r0 * sin(ap))
        let p1 = asin(rp / r1 * sin(ap))
        if ((da0 -= p0 * 2) > epsilon) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0
        else da0 = 0, a00 = a10 = (a0 + a1) / 2
        if ((da1 -= p1 * 2) > epsilon) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1
        else da1 = 0, a01 = a11 = (a0 + a1) / 2
      }

      const x01 = r1 * cos(a01)
      const y01 = r1 * sin(a01)
      const x10 = r0 * cos(a10)
      const y10 = r0 * sin(a10)
      let x11 = r1 * cos(a11)
      let y11 = r1 * sin(a11)
      let x00 = r0 * cos(a00)
      let y00 = r0 * sin(a00)

      // Apply rounded corners?
      if (rc > epsilon) {
        let oc: [number, number] | undefined

        // Restrict the corner radius according to the sector angle. If this
        // intersection fails, it's probably because the arc is too small, so
        // disable the corner radius entirely.
        if (da < pi) {
          if (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10)) {
            const ax = x01 - oc[0]
            const ay = y01 - oc[1]
            const bx = x11 - oc[0]
            const by = y11 - oc[1]
            const kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2)
            const lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1])
            rc0 = min(rc, (r0 - lc) / (kc - 1))
            rc1 = min(rc, (r1 - lc) / (kc + 1))
          } else {
            rc0 = rc1 = 0
          }
        }
      }

      // Is the sector collapsed to a line?
      if (!(da1 > epsilon)) context.moveTo(x01, y01)

      // Does the sector's outer ring have rounded corners?
      else if (rc1 > epsilon) {
        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw)
        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw)

        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01)

        // Have the corners merged?
        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw)

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw)
          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw)
          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw)
        }
      }

      // Or is the outer ring just a circular arc?
      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw)

      // Is there no inner ring, and it's a circular sector?
      // Or perhaps it's an annular sector collapsed due to padding?
      if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10)

      // Does the sector's inner ring (or point) have rounded corners?
      else if (rc0 > epsilon) {
        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw)
        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw)

        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01)

        // Have the corners merged?
        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw)

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw)
          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw)
          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw)
        }
      }

      // Or is the inner ring just a circular arc?
      else context.arc(0, 0, r0, a10, a00, cw)
    }

    context.closePath()

    if (buffer) return context = null, buffer + '' || null
  }

  arc.centroid = function (this: any): [number, number] {
    const r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2
    const a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2
    return [cos(a) * r, sin(a) * r]
  }

  arc.innerRadius = function (_?: any): any {
    return arguments.length ? (innerRadius = typeof _ === 'function' ? _ : constant(+_), arc) : innerRadius
  }

  arc.outerRadius = function (_?: any): any {
    return arguments.length ? (outerRadius = typeof _ === 'function' ? _ : constant(+_), arc) : outerRadius
  }

  arc.cornerRadius = function (_?: any): any {
    return arguments.length ? (cornerRadius = typeof _ === 'function' ? _ : constant(+_), arc) : cornerRadius
  }

  arc.padRadius = function (_?: any): any {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === 'function' ? _ : constant(+_), arc) : padRadius
  }

  arc.startAngle = function (_?: any): any {
    return arguments.length ? (startAngle = typeof _ === 'function' ? _ : constant(+_), arc) : startAngle
  }

  arc.endAngle = function (_?: any): any {
    return arguments.length ? (endAngle = typeof _ === 'function' ? _ : constant(+_), arc) : endAngle
  }

  arc.padAngle = function (_?: any): any {
    return arguments.length ? (padAngle = typeof _ === 'function' ? _ : constant(+_), arc) : padAngle
  }

  arc.context = function (_?: any): any {
    return arguments.length ? ((context = _ == null ? null : _), arc) : context
  }

  return arc
}
