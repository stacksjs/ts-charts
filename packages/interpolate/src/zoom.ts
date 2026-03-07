const epsilon2 = 1e-12

function cosh(x: number): number {
  return ((x = Math.exp(x)) + 1 / x) / 2
}

function sinh(x: number): number {
  return ((x = Math.exp(x)) - 1 / x) / 2
}

function tanh(x: number): number {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1)
}

interface ZoomInterpolation {
  (t: number): [number, number, number]
  duration: number
}

interface ZoomInterpolator {
  (p0: [number, number, number], p1: [number, number, number]): ZoomInterpolation
  rho(_: number): ZoomInterpolator
}

export default (function zoomRho(rho: number, rho2: number, rho4: number): ZoomInterpolator {

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0: [number, number, number], p1: [number, number, number]): ZoomInterpolation {
    const ux0 = p0[0], uy0 = p0[1], w0 = p0[2]
    const ux1 = p1[0], uy1 = p1[1], w1 = p1[2]
    const dx = ux1 - ux0
    const dy = uy1 - uy0
    const d2 = dx * dx + dy * dy
    let i: ZoomInterpolation
    let S: number

    // Special case for u0 ~ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho
      i = function (t: number): [number, number, number] {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S),
        ]
      } as ZoomInterpolation
    }

    // General case.
    else {
      const d1 = Math.sqrt(d2)
      const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1)
      const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1)
      const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
      const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
      S = (r1 - r0) / rho
      i = function (t: number): [number, number, number] {
        const s = t * S
        const coshr0 = cosh(r0)
        const u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0))
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0),
        ]
      } as ZoomInterpolation
    }

    i.duration = S * 1000 * rho / Math.SQRT2

    return i
  }

  zoom.rho = function (_: number): ZoomInterpolator {
    const _1 = Math.max(1e-3, +_)
    const _2 = _1 * _1
    const _4 = _2 * _2
    return zoomRho(_1, _2, _4)
  }

  return zoom
})(Math.SQRT2, 2, 4) as ZoomInterpolator
