import count from '../count.ts'
import quantile from '../quantile.ts'

export default function thresholdFreedmanDiaconis(values: ArrayLike<number>, min: number, max: number): number {
  const c = count(values as any)
  const d = quantile(values as any, 0.75)! - quantile(values as any, 0.25)!
  return c && d ? Math.ceil((max - min) / (2 * d * Math.pow(c, -1 / 3))) : 1
}
