import count from '../count.ts'
import deviation from '../deviation.ts'

export default function thresholdScott(values: ArrayLike<number>, min: number, max: number): number {
  const c = count(values as any)
  const d = deviation(values as any)
  return c && d ? Math.ceil((max - min) * Math.cbrt(c) / (3.49 * d)) : 1
}
