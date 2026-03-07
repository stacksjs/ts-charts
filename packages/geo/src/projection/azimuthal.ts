import { asin, atan2, cos, sin, sqrt } from '../math.ts'

export function azimuthalRaw(scale: (cxcy: number) => number): any {
  return function (x: number, y: number): number[] {
    const cx = cos(x),
        cy = cos(y),
        k = scale(cx * cy)
    if (k === Infinity) return [2, 0]
    return [
      k * cy * sin(x),
      k * sin(y)
    ]
  }
}

export function azimuthalInvert(angle: (z: number) => number): (x: number, y: number) => number[] {
  return function (x: number, y: number): number[] {
    const z = sqrt(x * x + y * y),
        c = angle(z),
        sc = sin(c),
        cc = cos(c)
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ]
  }
}
