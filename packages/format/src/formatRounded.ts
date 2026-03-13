import { formatDecimalParts } from './formatDecimal.ts'

export default function formatRounded(x: number, p: number): string {
  const d = formatDecimalParts(x, p)
  if (!d) return `${x}`
  const coefficient = d[0]
  const exponentVal = d[1]
  return exponentVal < 0 ? `0.${new Array(-exponentVal).join('0')}${coefficient}`
    : coefficient.length > exponentVal + 1 ? `${coefficient.slice(0, exponentVal + 1)}.${coefficient.slice(exponentVal + 1)}`
      : `${coefficient}${new Array(exponentVal - coefficient.length + 2).join('0')}`
}
