import { abs, epsilon } from './math.ts'

export default function pointEqual(a: number[], b: number[]): boolean {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon
}
