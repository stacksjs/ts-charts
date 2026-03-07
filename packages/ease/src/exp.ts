import { tpmt } from './math.ts'

export function expIn(t: number): number {
  return tpmt(1 - +t)
}

export function expOut(t: number): number {
  return 1 - tpmt(t)
}

export function expInOut(t: number): number {
  return ((t *= 2) <= 1 ? tpmt(1 - t) : 2 - tpmt(t - 1)) / 2
}
