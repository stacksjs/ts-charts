import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type g', () => {
  test('format("g") can output general notation', () => {
    expect(format('.1g')(0.049)).toBe('0.05')
    expect(format('.1g')(0.49)).toBe('0.5')
    expect(format('.2g')(0.449)).toBe('0.45')
    expect(format('.3g')(0.4449)).toBe('0.445')
    expect(format('.5g')(0.444449)).toBe('0.44445')
    expect(format('.1g')(100)).toBe('1e+2')
    expect(format('.2g')(100)).toBe('1.0e+2')
    expect(format('.3g')(100)).toBe('100')
    expect(format('.5g')(100)).toBe('100.00')
    expect(format('.5g')(100.2)).toBe('100.20')
    expect(format('.2g')(0.002)).toBe('0.0020')
  })

  test('format(",g") can group thousands with general notation', () => {
    const f = format(',.12g')
    expect(f(0)).toBe('0.00000000000')
    expect(f(42)).toBe('42.0000000000')
    expect(f(42000000)).toBe('42,000,000.0000')
    expect(f(420000000)).toBe('420,000,000.000')
    expect(f(-4)).toBe('\u22124.00000000000')
    expect(f(-42)).toBe('\u221242.0000000000')
    expect(f(-4200000)).toBe('\u22124,200,000.00000')
    expect(f(-42000000)).toBe('\u221242,000,000.0000')
  })
})
