const pi: number = Math.PI
const halfPi: number = pi / 2

export function sinIn(t: number): number {
  return (+t === 1) ? 1 : 1 - Math.cos(t * halfPi)
}

export function sinOut(t: number): number {
  return Math.sin(t * halfPi)
}

export function sinInOut(t: number): number {
  return (1 - Math.cos(pi * t)) / 2
}
