import { formatDecimalParts } from './formatDecimal.ts'

export let prefixExponent: number | undefined

export default function formatPrefixAuto(x: number, p: number): string {
  const d = formatDecimalParts(x, p)
  if (!d) {
    prefixExponent = undefined
    return x.toPrecision(p)
  }
  const coefficient = d[0]
  const exponentVal = d[1]
  prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponentVal / 3))) * 3
  const i = exponentVal - prefixExponent + 1
  const n = coefficient.length
  return i === n ? coefficient
    : i > n ? coefficient + new Array(i - n + 1).join('0')
      : i > 0 ? coefficient.slice(0, i) + '.' + coefficient.slice(i)
        : '0.' + new Array(1 - i).join('0') + formatDecimalParts(x, Math.max(0, p + i - 1))![0] // less than 1y!
}
