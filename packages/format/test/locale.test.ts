import { describe, expect, test } from 'bun:test'
import { formatLocale } from '../src/index.ts'

const enIN = {
  decimal: '.',
  thousands: ',',
  grouping: [3, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  currency: ['₹', ''] as [string, string],
}

describe('locale', () => {
  test('formatLocale({decimal: decimal}) observes the specified decimal point', () => {
    expect(formatLocale({ decimal: '|' }).format('06.2f')(2)).toBe('002|00')
    expect(formatLocale({ decimal: '/' }).format('06.2f')(2)).toBe('002/00')
  })

  test('formatLocale({currency: [prefix, suffix]}) observes the specified currency prefix and suffix', () => {
    expect(formatLocale({ decimal: '.', currency: ['\u0e3f', ''] }).format('$06.2f')(2)).toBe('\u0e3f02.00')
    expect(formatLocale({ decimal: '.', currency: ['', '\u0e3f'] }).format('$06.2f')(2)).toBe('02.00\u0e3f')
  })

  test('formatLocale({currency: [prefix, suffix]}) places the currency suffix after the SI suffix', () => {
    expect(formatLocale({ decimal: ',', currency: ['', ' \u20ac'] }).format('$.3s')(1.2e9)).toBe('1,20G \u20ac')
  })

  test('formatLocale({grouping: undefined}) does not perform any grouping', () => {
    expect(formatLocale({ decimal: '.' }).format('012,.2f')(2)).toBe('000000002.00')
  })

  test('formatLocale({grouping: [sizes...]}) observes the specified group sizes', () => {
    expect(formatLocale({ decimal: '.', grouping: [3], thousands: ',' }).format('012,.2f')(2)).toBe('0,000,002.00')
    expect(formatLocale({ decimal: '.', grouping: [2], thousands: ',' }).format('012,.2f')(2)).toBe('0,00,00,02.00')
    expect(formatLocale({ decimal: '.', grouping: [2, 3], thousands: ',' }).format('012,.2f')(2)).toBe('00,000,02.00')
    expect(formatLocale({ decimal: '.', grouping: [3, 2, 2, 2, 2, 2, 2], thousands: ',' }).format(',d')(1e12)).toBe('10,00,00,00,00,000')
  })

  test('formatLocale(...) can format numbers using the Indian numbering system.', () => {
    const format = formatLocale(enIN).format(',')
    expect(format(10)).toBe('10')
    expect(format(100)).toBe('100')
    expect(format(1000)).toBe('1,000')
    expect(format(10000)).toBe('10,000')
    expect(format(100000)).toBe('1,00,000')
    expect(format(1000000)).toBe('10,00,000')
    expect(format(10000000)).toBe('1,00,00,000')
    expect(format(10000000.4543)).toBe('1,00,00,000.4543')
    expect(format(1000.321)).toBe('1,000.321')
    expect(format(10.5)).toBe('10.5')
    expect(format(-10)).toBe('\u221210')
    expect(format(-100)).toBe('\u2212100')
    expect(format(-1000)).toBe('\u22121,000')
    expect(format(-10000)).toBe('\u221210,000')
    expect(format(-100000)).toBe('\u22121,00,000')
    expect(format(-1000000)).toBe('\u221210,00,000')
    expect(format(-10000000)).toBe('\u22121,00,00,000')
    expect(format(-10000000.4543)).toBe('\u22121,00,00,000.4543')
    expect(format(-1000.321)).toBe('\u22121,000.321')
    expect(format(-10.5)).toBe('\u221210.5')
  })

  test('formatLocale({thousands: separator}) observes the specified group separator', () => {
    expect(formatLocale({ decimal: '.', grouping: [3], thousands: ' ' }).format('012,.2f')(2)).toBe('0 000 002.00')
    expect(formatLocale({ decimal: '.', grouping: [3], thousands: '/' }).format('012,.2f')(2)).toBe('0/000/002.00')
  })

  test('formatLocale({percent: percent}) observes the specified percent sign', () => {
    expect(formatLocale({ decimal: '.', percent: '!' }).format('06.2%')(2)).toBe('200.00!')
    expect(formatLocale({ decimal: '.', percent: '\ufe6a' }).format('06.2%')(2)).toBe('200.00\ufe6a')
  })

  test('formatLocale({minus: minus}) observes the specified minus sign', () => {
    expect(formatLocale({ decimal: '.', minus: '-' }).format('06.2f')(-2)).toBe('-02.00')
    expect(formatLocale({ decimal: '.', minus: '\u2212' }).format('06.2f')(-2)).toBe('\u221202.00')
    expect(formatLocale({ decimal: '.', minus: '\u2796' }).format('06.2f')(-2)).toBe('\u279602.00')
    expect(formatLocale({ decimal: '.' }).format('06.2f')(-2)).toBe('\u221202.00')
  })

  test('formatLocale({nan: nan}) observes the specified not-a-number representation', () => {
    expect(formatLocale({ nan: 'N/A' }).format('6.2f')(undefined)).toBe('   N/A')
    expect(formatLocale({ nan: '-' }).format('<6.2g')(undefined)).toBe('-     ')
    expect(formatLocale({}).format(' 6.2f')(undefined)).toBe('   NaN')
  })
})
