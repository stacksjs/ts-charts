import { tickStep } from '@ts-charts/array'
import { format, formatPrefix, FormatSpecifier, formatSpecifier, precisionFixed, precisionPrefix, precisionRound } from '@ts-charts/format'

export default function tickFormat(start: number, stop: number, count: number, specifier?: string): (n: number) => string {
  const step = tickStep(start, stop, count)
  let precision: number
  const spec: FormatSpecifier = formatSpecifier(specifier == null ? ',f' : specifier)
  switch (spec.type) {
    case 's': {
      const value = Math.max(Math.abs(start), Math.abs(stop))
      if (spec.precision == null && !isNaN(precision = precisionPrefix(step, value))) spec.precision = precision
      // eslint-disable-next-line pickier/no-unused-vars
      return formatPrefix(spec.toString(), value) as (n: number) => string
    }
    case '':
    case 'e':
    case 'g':
    case 'p':
    case 'r': {
      if (spec.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) spec.precision = precision - (spec.type === 'e' ? 1 : 0)
      break
    }
    case 'f':
    case '%': {
      if (spec.precision == null && !isNaN(precision = precisionFixed(step))) spec.precision = precision - (spec.type === '%' ? 1 : 0) * 2
      break
    }
  }
  // eslint-disable-next-line pickier/no-unused-vars
  return format(spec.toString()) as (n: number) => string
}
