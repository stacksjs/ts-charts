import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type e', () => {
  test('format("e") can output exponent notation', () => {
    const f = format('e')
    expect(f(0)).toBe('0.000000e+0')
    expect(f(42)).toBe('4.200000e+1')
    expect(f(42000000)).toBe('4.200000e+7')
    expect(f(420000000)).toBe('4.200000e+8')
    expect(f(-4)).toBe('\u22124.000000e+0')
    expect(f(-42)).toBe('\u22124.200000e+1')
    expect(f(-4200000)).toBe('\u22124.200000e+6')
    expect(f(-42000000)).toBe('\u22124.200000e+7')
    expect(format('.0e')(42)).toBe('4e+1')
    expect(format('.3e')(42)).toBe('4.200e+1')
  })

  test('format("e") can format negative zero as zero', () => {
    expect(format('1e')(-0)).toBe('0.000000e+0')
    expect(format('1e')(-1e-12)).toBe('\u22121.000000e-12')
  })

  test('format(",e") does not group Infinity', () => {
    expect(format(',e')(Infinity)).toBe('Infinity')
  })

  test('format(".3e") can format negative infinity', () => {
    expect(format('.3e')(-Infinity)).toBe('\u2212Infinity')
  })
})
