import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type n', () => {
  test('format("n") is an alias for ",g"', () => {
    const f = format('.12n')
    expect(f(0)).toBe('0.00000000000')
    expect(f(42)).toBe('42.0000000000')
    expect(f(42000000)).toBe('42,000,000.0000')
    expect(f(420000000)).toBe('420,000,000.000')
    expect(f(-4)).toBe('\u22124.00000000000')
    expect(f(-42)).toBe('\u221242.0000000000')
    expect(f(-4200000)).toBe('\u22124,200,000.00000')
    expect(f(-42000000)).toBe('\u221242,000,000.0000')
    expect(f(.0042)).toBe('0.00420000000000')
    expect(f(.42)).toBe('0.420000000000')
    expect(f(1e21)).toBe('1.00000000000e+21')
  })

  test('format("n") uses zero padding', () => {
    expect(format('01.0n')(0)).toBe('0')
    expect(format('02.0n')(0)).toBe('00')
    expect(format('03.0n')(0)).toBe('000')
    expect(format('05.0n')(0)).toBe('0,000')
    expect(format('08.0n')(0)).toBe('0,000,000')
    expect(format('013.0n')(0)).toBe('0,000,000,000')
    expect(format('021.0n')(0)).toBe('0,000,000,000,000,000')
    expect(format('013.8n')(-42000000)).toBe('\u22120,042,000,000')
  })
})
