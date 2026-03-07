import { formatDecimalParts } from './formatDecimal.ts'

export default function exponent(x: number): number {
  const parts = formatDecimalParts(Math.abs(x))
  return parts ? parts[1] : NaN
}
