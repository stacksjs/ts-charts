import { describe, expect, test } from 'bun:test'
import { format, formatPrefix, formatDefaultLocale } from '../src/index.ts'

const enUs = {
  decimal: '.',
  thousands: ',',
  grouping: [3],
  currency: ['$', ''] as [string, string],
}

const frFr = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', '\u00a0\u20ac'] as [string, string],
  percent: '\u202f%',
}

describe('defaultLocale', () => {
  test('formatDefaultLocale(definition) returns the new default locale', () => {
    const locale = formatDefaultLocale(frFr)
    try {
      expect(locale.format('$,.2f')(12345678.90)).toBe('12.345.678,90\u00a0\u20ac')
      expect(locale.format(',.0%')(12345678.90)).toBe('1.234.567.890\u202f%')
    } finally {
      formatDefaultLocale(enUs)
    }
  })

  test('formatDefaultLocale(definition) affects format', () => {
    const locale = formatDefaultLocale(frFr)
    try {
      expect(format).toBe(locale.format)
      expect(format('$,.2f')(12345678.90)).toBe('12.345.678,90\u00a0\u20ac')
    } finally {
      formatDefaultLocale(enUs)
    }
  })

  test('formatDefaultLocale(definition) affects formatPrefix', () => {
    const locale = formatDefaultLocale(frFr)
    try {
      expect(formatPrefix).toBe(locale.formatPrefix)
      expect(formatPrefix(',.2', 1e3)(12345678.90)).toBe('12.345,68k')
    } finally {
      formatDefaultLocale(enUs)
    }
  })
})
