import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type none', () => {
  test('format(".[precision]") uses significant precision and trims insignificant zeros', () => {
    expect(format('.1')(4.9)).toBe('5')
    expect(format('.1')(0.49)).toBe('0.5')
    expect(format('.2')(4.9)).toBe('4.9')
    expect(format('.2')(0.49)).toBe('0.49')
    expect(format('.2')(0.449)).toBe('0.45')
    expect(format('.3')(4.9)).toBe('4.9')
    expect(format('.3')(0.49)).toBe('0.49')
    expect(format('.3')(0.449)).toBe('0.449')
    expect(format('.3')(0.4449)).toBe('0.445')
    expect(format('.5')(0.444449)).toBe('0.44445')
  })

  test('format(".[precision]") does not trim significant zeros', () => {
    expect(format('.5')(10)).toBe('10')
    expect(format('.5')(100)).toBe('100')
    expect(format('.5')(1000)).toBe('1000')
    expect(format('.5')(21010)).toBe('21010')
    expect(format('.5')(1.10001)).toBe('1.1')
    expect(format('.5')(1.10001e6)).toBe('1.1e+6')
    expect(format('.6')(1.10001)).toBe('1.10001')
    expect(format('.6')(1.10001e6)).toBe('1.10001e+6')
  })

  test('format(".[precision]") also trims the decimal point if there are only insignificant zeros', () => {
    expect(format('.5')(1.00001)).toBe('1')
    expect(format('.5')(1.00001e6)).toBe('1e+6')
    expect(format('.6')(1.00001)).toBe('1.00001')
    expect(format('.6')(1.00001e6)).toBe('1.00001e+6')
  })

  test('format("$") can output a currency', () => {
    const f = format('$')
    expect(f(0)).toBe('$0')
    expect(f(.042)).toBe('$0.042')
    expect(f(.42)).toBe('$0.42')
    expect(f(4.2)).toBe('$4.2')
    expect(f(-.042)).toBe('\u2212$0.042')
    expect(f(-.42)).toBe('\u2212$0.42')
    expect(f(-4.2)).toBe('\u2212$4.2')
  })

  test('format("($") can output a currency with parentheses for negative values', () => {
    const f = format('($')
    expect(f(0)).toBe('$0')
    expect(f(.042)).toBe('$0.042')
    expect(f(.42)).toBe('$0.42')
    expect(f(4.2)).toBe('$4.2')
    expect(f(-.042)).toBe('($0.042)')
    expect(f(-.42)).toBe('($0.42)')
    expect(f(-4.2)).toBe('($4.2)')
  })

  test('format("") can format negative zero as zero', () => {
    expect(format('')(-0)).toBe('0')
  })

  test('format("") can format negative infinity', () => {
    expect(format('')(-Infinity)).toBe('\u2212Infinity')
  })
})
