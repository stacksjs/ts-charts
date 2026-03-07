const degrees = 180 / Math.PI

export interface DecomposeResult {
  translateX: number
  translateY: number
  rotate: number
  skewX: number
  scaleX: number
  scaleY: number
}

export const identity: DecomposeResult = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1,
}

export default function decompose(a: number, b: number, c: number, d: number, e: number, f: number): DecomposeResult {
  let scaleX: number, scaleY: number, skewX: number
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY,
  }
}
