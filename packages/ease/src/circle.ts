export function circleIn(t: number): number {
  return 1 - Math.sqrt(1 - t * t)
}

export function circleOut(t: number): number {
  return Math.sqrt(1 - --t * t)
}

export function circleInOut(t: number): number {
  return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2
}
