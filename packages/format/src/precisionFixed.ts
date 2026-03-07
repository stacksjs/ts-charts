import exponent from './exponent.ts'

export default function precisionFixed(step: number): number {
  return Math.max(0, -exponent(Math.abs(step)))
}
