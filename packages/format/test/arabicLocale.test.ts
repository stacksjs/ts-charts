import { describe, expect, test } from 'bun:test'
import { formatLocale } from '../src/index.ts'
import type { LocaleDefinition } from '../src/index.ts'

const arabicNumerals = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669']

const locales: Record<string, LocaleDefinition> = {
  'ar-001': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ''], numerals: arabicNumerals },
  'ar-AE': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062f.\u0625.'], numerals: arabicNumerals },
  'ar-BH': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062f.\u0628.'], numerals: arabicNumerals },
  'ar-DJ': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['\u200fFdj ', ''], numerals: arabicNumerals },
  'ar-DZ': { decimal: ',', thousands: '.', grouping: [3], currency: ['\u062f.\u062c. ', ''] },
  'ar-EG': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062c.\u0645.'], numerals: arabicNumerals },
  'ar-EH': { decimal: '.', thousands: ',', grouping: [3], currency: ['\u062f.\u0645. ', ''] },
  'ar-ER': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['Nfk ', ''], numerals: arabicNumerals },
  'ar-IL': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['\u20aa ', ''], numerals: arabicNumerals },
  'ar-IQ': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062f.\u0639.'], numerals: arabicNumerals },
  'ar-JO': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062f.\u0623.'], numerals: arabicNumerals },
  'ar-KM': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0641.\u062c.\u0642.'], numerals: arabicNumerals },
  'ar-KW': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062f.\u0643.'], numerals: arabicNumerals },
  'ar-LB': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0644.\u0644.'], numerals: arabicNumerals },
  'ar-MA': { decimal: ',', thousands: '.', grouping: [3], currency: ['\u062f.\u0645. ', ''] },
  'ar-MR': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0623.\u0645.'], numerals: arabicNumerals },
  'ar-OM': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0631.\u0639.'], numerals: arabicNumerals },
  'ar-PS': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['\u20aa ', ''], numerals: arabicNumerals },
  'ar-QA': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0631.\u0642.'], numerals: arabicNumerals },
  'ar-SA': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0631.\u0633.'], numerals: arabicNumerals },
  'ar-SD': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u062c.\u0633.'], numerals: arabicNumerals },
  'ar-SO': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['\u200fS ', ''], numerals: arabicNumerals },
  'ar-SS': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['\u00a3 ', ''], numerals: arabicNumerals },
  'ar-SY': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0644.\u0633.'], numerals: arabicNumerals },
  'ar-TD': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['\u200fFCFA ', ''], numerals: arabicNumerals },
  'ar-TN': { decimal: ',', thousands: '.', grouping: [3], currency: ['\u062f.\u062a. ', ''] },
  'ar-YE': { decimal: '\u066b', thousands: '\u066c', grouping: [3], currency: ['', ' \u0631.\u0649.'], numerals: arabicNumerals },
}

function locale(name: string): ReturnType<typeof formatLocale> {
  return formatLocale(locales[name])
}

describe('arabicLocale', () => {
  test('formatLocale() can format numbers using ar-001 locale', () => {
    expect(locale('ar-001').format('$,.2f')(-1234.56)).toBe('\u2212\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-AE locale', () => {
    expect(locale('ar-AE').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062f.\u0625.')
  })

  test('formatLocale() can format numbers using ar-BH locale', () => {
    expect(locale('ar-BH').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062f.\u0628.')
  })

  test('formatLocale() can format numbers using ar-DJ locale', () => {
    expect(locale('ar-DJ').format('$,.2f')(1234.56)).toBe('\u200fFdj \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-DZ locale', () => {
    expect(locale('ar-DZ').format('$,.2f')(1234.56)).toBe('\u062f.\u062c. 1.234,56')
  })

  test('formatLocale() can format numbers using ar-EG locale', () => {
    expect(locale('ar-EG').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062c.\u0645.')
  })

  test('formatLocale() can format numbers using ar-EH locale', () => {
    expect(locale('ar-EH').format('$,.2f')(1234.56)).toBe('\u062f.\u0645. 1,234.56')
  })

  test('formatLocale() can format numbers using ar-ER locale', () => {
    expect(locale('ar-ER').format('$,.2f')(1234.56)).toBe('Nfk \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-IL locale', () => {
    expect(locale('ar-IL').format('$,.2f')(1234.56)).toBe('\u20aa \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-IQ locale', () => {
    expect(locale('ar-IQ').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062f.\u0639.')
  })

  test('formatLocale() can format numbers using ar-JO locale', () => {
    expect(locale('ar-JO').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062f.\u0623.')
  })

  test('formatLocale() can format numbers using ar-KM locale', () => {
    expect(locale('ar-KM').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0641.\u062c.\u0642.')
  })

  test('formatLocale() can format numbers using ar-KW locale', () => {
    expect(locale('ar-KW').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062f.\u0643.')
  })

  test('formatLocale() can format numbers using ar-LB locale', () => {
    expect(locale('ar-LB').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0644.\u0644.')
  })

  test('formatLocale() can format numbers using ar-MA locale', () => {
    expect(locale('ar-MA').format('$,.2f')(1234.56)).toBe('\u062f.\u0645. 1.234,56')
  })

  test('formatLocale() can format numbers using ar-MR locale', () => {
    expect(locale('ar-MR').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0623.\u0645.')
  })

  test('formatLocale() can format numbers using ar-OM locale', () => {
    expect(locale('ar-OM').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0631.\u0639.')
  })

  test('formatLocale() can format numbers using ar-PS locale', () => {
    expect(locale('ar-PS').format('$,.2f')(1234.56)).toBe('\u20aa \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-QA locale', () => {
    expect(locale('ar-QA').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0631.\u0642.')
  })

  test('formatLocale() can format numbers using ar-SA locale', () => {
    expect(locale('ar-SA').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0631.\u0633.')
  })

  test('formatLocale() can format numbers using ar-SD locale', () => {
    expect(locale('ar-SD').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u062c.\u0633.')
  })

  test('formatLocale() can format numbers using ar-SO locale', () => {
    expect(locale('ar-SO').format('$,.2f')(1234.56)).toBe('\u200fS \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-SS locale', () => {
    expect(locale('ar-SS').format('$,.2f')(1234.56)).toBe('\u00a3 \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-SY locale', () => {
    expect(locale('ar-SY').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0644.\u0633.')
  })

  test('formatLocale() can format numbers using ar-TD locale', () => {
    expect(locale('ar-TD').format('$,.2f')(1234.56)).toBe('\u200fFCFA \u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666')
  })

  test('formatLocale() can format numbers using ar-TN locale', () => {
    expect(locale('ar-TN').format('$,.2f')(1234.56)).toBe('\u062f.\u062a. 1.234,56')
  })

  test('formatLocale() can format numbers using ar-YE locale', () => {
    expect(locale('ar-YE').format('$,.2f')(1234.56)).toBe('\u0661\u066c\u0662\u0663\u0664\u066b\u0665\u0666 \u0631.\u0649.')
  })
})
