import exponent from './exponent.ts'

export default function precisionPrefix(step: number, value: number): number {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)))
}
