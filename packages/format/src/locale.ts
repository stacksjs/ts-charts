import exponent from './exponent.ts'
import formatGroup from './formatGroup.ts'
import formatNumerals from './formatNumerals.ts'
import formatSpecifier from './formatSpecifier.ts'
import formatTrim from './formatTrim.ts'
import formatTypes from './formatTypes.ts'
import { prefixExponent } from './formatPrefixAuto.ts'
import identity from './identity.ts'

export interface LocaleDefinition {
  decimal?: string
  thousands?: string
  grouping?: number[]
  currency?: [string, string]
  numerals?: string[]
  percent?: string
  minus?: string
  nan?: string
}

export interface LocaleObject {
  format: (specifier: string, options?: FormatOptions) => (value: number | string | { valueOf(): number } | undefined) => string
  formatPrefix: (specifier: string, value: number) => (value: number) => string
}

export interface FormatOptions {
  prefix?: string
  suffix?: string
}

const map = Array.prototype.map
const prefixes = ['y', 'z', 'a', 'f', 'p', 'n', '\u00b5', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

export default function formatLocale(locale: LocaleDefinition): LocaleObject {
  const group = locale.grouping === undefined || locale.thousands === undefined
    ? identity
    : formatGroup(map.call(locale.grouping, Number) as number[], locale.thousands + '')
  const currencyPrefix = locale.currency === undefined ? '' : locale.currency[0] + ''
  const currencySuffix = locale.currency === undefined ? '' : locale.currency[1] + ''
  const decimal = locale.decimal === undefined ? '.' : locale.decimal + ''
  const numerals = locale.numerals === undefined
    ? identity
    : formatNumerals(map.call(locale.numerals, String) as string[])
  const percent = locale.percent === undefined ? '%' : locale.percent + ''
  const minus = locale.minus === undefined ? '\u2212' : locale.minus + ''
  const nan = locale.nan === undefined ? 'NaN' : locale.nan + ''

  function newFormat(specifier: string, options?: FormatOptions): (value: number | string | { valueOf(): number } | undefined) => string {
    const spec = formatSpecifier(specifier)

    let fill = spec.fill
    let align = spec.align
    const sign = spec.sign
    const symbol = spec.symbol
    let zero = spec.zero
    const width = spec.width
    let comma = spec.comma
    let precision = spec.precision
    let trim = spec.trim
    let type = spec.type

    // The "n" type is an alias for ",g".
    if (type === 'n') { comma = true; type = 'g' }

    // The "" type, and any invalid type, is an alias for ".12~g".
    else if (!formatTypes[type]) { if (precision === undefined) precision = 12; trim = true; type = 'g' }

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === '0' && align === '=')) { zero = true; fill = '0'; align = '=' }

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    const prefix = (options && options.prefix !== undefined ? options.prefix : '') + (symbol === '$' ? currencyPrefix : symbol === '#' && /[boxX]/.test(type) ? '0' + type.toLowerCase() : '')
    const suffix = (symbol === '$' ? currencySuffix : /[%p]/.test(type) ? percent : '') + (options && options.suffix !== undefined ? options.suffix : '')

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    const formatType = formatTypes[type]
    const maybeSuffix = /[defgprs%]/.test(type)

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision === undefined ? 6
      : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision))

    // eslint-disable-next-line ts/no-explicit-any -- D3's format mutates value across number/string types internally
    function format(value: any): string {
      let valuePrefix = prefix
      let valueSuffix = suffix
      let i: number
      let n: number
      let c: number

      if (type === 'c') {
        valueSuffix = formatType(value) + valueSuffix
        value = ''
      } else {
        value = +value

        // Determine the sign. -0 is not less than 0, but 1 / -0 is!
        let valueNegative = value < 0 || 1 / value < 0

        // Perform the initial formatting.
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision)

        // Trim insignificant zeros.
        if (trim) value = formatTrim(value)

        // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
        if (valueNegative && +value === 0 && sign !== '+') valueNegative = false

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === '(' ? sign : minus) : sign === '-' || sign === '(' ? '' : sign) + valuePrefix
        valueSuffix = (type === 's' && !isNaN(value) && prefixExponent !== undefined ? prefixes[8 + prefixExponent / 3] : '') + valueSuffix + (valueNegative && sign === '(' ? ')' : '')

        // Break the formatted value into the integer "value" part that can be
        // grouped, and fractional or exponential "suffix" part that is not.
        if (maybeSuffix) {
          i = -1
          n = value.length
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix
              value = value.slice(0, i)
              break
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity)

      // Compute the padding.
      const length = valuePrefix.length + value.length + valueSuffix.length
      let padding = length < (width ?? 0) ? new Array((width ?? 0) - length + 1).join(fill) : ''

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) { value = group(padding + value, padding.length ? (width ?? 0) - valueSuffix.length : Infinity); padding = '' }

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case '<': value = valuePrefix + value + valueSuffix + padding; break
        case '=': value = valuePrefix + padding + value + valueSuffix; break
        case '^': {
          const half = padding.length >> 1
          value = padding.slice(0, half) + valuePrefix + value + valueSuffix + padding.slice(half)
          break
        }
        default: value = padding + valuePrefix + value + valueSuffix; break
      }

      return numerals(value)
    }

    format.toString = function (): string {
      return spec + ''
    }

    return format
  }

  function newFormatPrefix(specifier: string, value: number): (value: number) => string {
    const spec = formatSpecifier(specifier)
    spec.type = 'f'
    const e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3
    const k = Math.pow(10, -e)
    const f = newFormat(spec + '', { suffix: prefixes[8 + e / 3] })
    return function (value: number): string {
      return f(k * value)
    }
  }

  return {
    format: newFormat,
    formatPrefix: newFormatPrefix,
  }
}
