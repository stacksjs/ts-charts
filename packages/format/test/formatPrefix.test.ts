import { describe, expect, test } from 'bun:test'
import { format, formatPrefix } from '../src/index.ts'

describe('formatPrefix', () => {
  test('formatPrefix(",.0s", value)(number) formats with the SI prefix appropriate to the specified value', () => {
    expect(formatPrefix(',.0s', 1e-6)(.00042)).toBe('420\u00b5')
    expect(formatPrefix(',.0s', 1e-6)(.0042)).toBe('4,200\u00b5')
  })

  test('formatPrefix(",.3s", value)(number) formats with the SI prefix appropriate to the specified value', () => {
    expect(formatPrefix(',.3s', 1e-3)(.00042)).toBe('0.420m')
  })

  test('formatPrefix(",.0s", value)(number) uses yocto for very small reference values', () => {
    expect(formatPrefix(',.0s', 1e-27)(1e-24)).toBe('1y')
  })

  test('formatPrefix(",.0s", value)(number) uses yotta for very small reference values', () => {
    expect(formatPrefix(',.0s', 1e27)(1e24)).toBe('1Y')
  })

  test('formatPrefix(" $12,.1s", value)(number) formats with the specified SI prefix', () => {
    const f = formatPrefix(' $12,.1s', 1e6)
    expect(f(-42e6)).toBe('     \u2212$42.0M')
    expect(f(+4.2e6)).toBe('       $4.2M')
  })

  test('formatPrefix(" $12,.1s", value)(number) matches format(" $12,.2s")(number) when the units are the same', () => {
    const fp = formatPrefix(' $12,.1s', 1e6)
    const f = format(' $12,.2s')
    expect(fp(+4.2e6)).toBe('       $4.2M')
    expect(f(+4.2e6)).toBe('       $4.2M')
  })

  test('formatPrefix("($~s", value)(number) formats with the SI prefix inside parentheses', () => {
    expect(formatPrefix('($~s', 1e3)(1e3)).toBe('$1k')
    expect(formatPrefix('($~s', 1e3)(-1e3)).toBe('($1k)')
  })
})
