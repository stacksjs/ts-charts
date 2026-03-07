export default function formatDecimal(x: number): string {
  return Math.abs(x = Math.round(x)) >= 1e21
    ? x.toLocaleString('en').replace(/,/g, '')
    : x.toString(10)
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ["123", 0].
export function formatDecimalParts(x: number, p?: number): [string, number] | null {
  if (!isFinite(x) || x === 0) return null // NaN, +/-Infinity, +/-0
  const xStr = p ? x.toExponential(p - 1) : x.toExponential()
  const i = xStr.indexOf('e')
  const coefficient = xStr.slice(0, i)

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +xStr.slice(i + 1),
  ]
}
