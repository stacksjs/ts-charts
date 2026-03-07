import formatDecimal from './formatDecimal.ts'
import formatPrefixAuto from './formatPrefixAuto.ts'
import formatRounded from './formatRounded.ts'

const formatTypes: Record<string, (x: number, p?: number) => string> = {
  '%': (x: number, p?: number): string => (x * 100).toFixed(p),
  'b': (x: number): string => Math.round(x).toString(2),
  'c': (x: number): string => x + '',
  'd': formatDecimal,
  'e': (x: number, p?: number): string => x.toExponential(p),
  'f': (x: number, p?: number): string => x.toFixed(p),
  'g': (x: number, p?: number): string => x.toPrecision(p),
  'o': (x: number): string => Math.round(x).toString(8),
  'p': (x: number, p?: number): string => formatRounded(x * 100, p!),
  'r': formatRounded as (x: number, p?: number) => string,
  's': formatPrefixAuto as (x: number, p?: number) => string,
  'X': (x: number): string => Math.round(x).toString(16).toUpperCase(),
  'x': (x: number): string => Math.round(x).toString(16),
}

export default formatTypes
