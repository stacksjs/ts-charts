import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type f', () => {
  test('format("f") can output fixed-point notation', () => {
    expect(format('.1f')(0.49)).toBe('0.5')
    expect(format('.2f')(0.449)).toBe('0.45')
    expect(format('.3f')(0.4449)).toBe('0.445')
    expect(format('.5f')(0.444449)).toBe('0.44445')
    expect(format('.1f')(100)).toBe('100.0')
    expect(format('.2f')(100)).toBe('100.00')
    expect(format('.3f')(100)).toBe('100.000')
    expect(format('.5f')(100)).toBe('100.00000')
  })

  test('format("+$,f") can output a currency with comma-grouping and sign', () => {
    const f = format('+$,.2f')
    expect(f(0)).toBe('+$0.00')
    expect(f(0.429)).toBe('+$0.43')
    expect(f(-0.429)).toBe('\u2212$0.43')
    expect(f(-1)).toBe('\u2212$1.00')
    expect(f(1e4)).toBe('+$10,000.00')
  })

  test('format(",.f") can group thousands, space fill, and round to significant digits', () => {
    expect(format('10,.1f')(123456.49)).toBe(' 123,456.5')
    expect(format('10,.2f')(1234567.449)).toBe('1,234,567.45')
    expect(format('10,.3f')(12345678.4449)).toBe('12,345,678.445')
    expect(format('10,.5f')(123456789.444449)).toBe('123,456,789.44445')
    expect(format('10,.1f')(123456)).toBe(' 123,456.0')
    expect(format('10,.2f')(1234567)).toBe('1,234,567.00')
    expect(format('10,.3f')(12345678)).toBe('12,345,678.000')
    expect(format('10,.5f')(123456789)).toBe('123,456,789.00000')
  })

  test('format("f") can display integers in fixed-point notation', () => {
    expect(format('f')(42)).toBe('42.000000')
  })

  test('format("f") can format negative zero as zero', () => {
    expect(format('f')(-0)).toBe('0.000000')
    expect(format('f')(-1e-12)).toBe('0.000000')
  })

  test('format("+f") signs negative zero correctly', () => {
    expect(format('+f')(-0)).toBe('\u22120.000000')
    expect(format('+f')(+0)).toBe('+0.000000')
    expect(format('+f')(-1e-12)).toBe('\u22120.000000')
    expect(format('+f')(+1e-12)).toBe('+0.000000')
  })

  test('format("f") can format negative infinity', () => {
    expect(format('f')(-Infinity)).toBe('\u2212Infinity')
  })

  test('format(",f") does not group Infinity', () => {
    expect(format(',f')(Infinity)).toBe('Infinity')
  })
})
