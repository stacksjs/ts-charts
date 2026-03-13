// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
const re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i

export interface FormatSpecifierObject {
  fill: string
  align: string
  // eslint-disable-next-line pickier/no-unused-vars
  sign: string
  symbol: string
  zero: boolean
  width: number | undefined
  comma: boolean
  precision: number | undefined
  trim: boolean
  type: string
}

export class FormatSpecifier {
  fill: string
  align: string
  sign: string
  symbol: string
  zero: boolean
  width: number | undefined
  comma: boolean
  precision: number | undefined
  trim: boolean
  type: string

  constructor(specifier: Record<string, any>) {
    // eslint-disable-next-line pickier/no-unused-vars
    this.fill = specifier.fill === undefined ? ' ' : `${specifier.fill}`
    // eslint-disable-next-line pickier/no-unused-vars
    this.align = specifier.align === undefined ? '>' : `${specifier.align}`
    // eslint-disable-next-line pickier/no-unused-vars
    this.sign = specifier.sign === undefined ? '-' : `${specifier.sign}`
    // eslint-disable-next-line pickier/no-unused-vars
    this.symbol = specifier.symbol === undefined ? '' : `${specifier.symbol}`
    this.zero = !!specifier.zero
    this.width = specifier.width === undefined ? undefined : +specifier.width
    this.comma = !!specifier.comma
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision
    this.trim = !!specifier.trim
    // eslint-disable-next-line pickier/no-unused-vars
    this.type = specifier.type === undefined ? '' : `${specifier.type}`
  }

  toString(): string {
    return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? '0' : '')
      + (this.width === undefined ? '' : Math.max(1, this.width | 0))
      + (this.comma ? ',' : '')
      // eslint-disable-next-line pickier/no-unused-vars
      + (this.precision === undefined ? '' : `.${Math.max(0, this.precision | 0)}`)
      + (this.trim ? '~' : '')
      + this.type
  }
}

function _formatSpecifier(specifier: string): FormatSpecifier {
  const match = re.exec(specifier)
  // eslint-disable-next-line pickier/no-unused-vars
  if (!match) throw new Error(`invalid format: ${specifier}`)
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10],
  })
}

// Set prototype so `instanceof formatSpecifier` works
_formatSpecifier.prototype = FormatSpecifier.prototype

const formatSpecifier: {
  (specifier: string): FormatSpecifier
  prototype: typeof FormatSpecifier.prototype
} = _formatSpecifier

export default formatSpecifier
