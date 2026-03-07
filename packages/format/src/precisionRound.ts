import exponent from './exponent.ts'

export default function precisionRound(step: number, max: number): number {
  step = Math.abs(step)
  max = Math.abs(max) - step
  return Math.max(0, exponent(max) - exponent(step)) + 1
}
