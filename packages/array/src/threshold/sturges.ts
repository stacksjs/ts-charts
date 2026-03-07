import count from '../count.ts'

export default function thresholdSturges(values: ArrayLike<number>): number {
  return Math.max(1, Math.ceil(Math.log(count(values as any)) / Math.LN2) + 1)
}
