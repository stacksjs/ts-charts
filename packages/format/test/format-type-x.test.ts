import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type x', () => {
  test('format("x") returns the expected hexadecimal (lowercase) string', () => {
    expect(format('x')(0xdeadbeef)).toBe('deadbeef')
  })

  test('format("#x") returns the expected hexadecimal (lowercase) string with prefix', () => {
    expect(format('#x')(0xdeadbeef)).toBe('0xdeadbeef')
  })

  test('format(",x") groups thousands', () => {
    expect(format(',x')(0xdeadbeef)).toBe('de,adb,eef')
  })

  test('format("#,x") does not group the prefix', () => {
    expect(format('#,x')(0xadeadbeef)).toBe('0xade,adb,eef')
  })

  test('format("+#x") puts the sign before the prefix', () => {
    expect(format('+#x')(0xdeadbeef)).toBe('+0xdeadbeef')
    expect(format('+#x')(-0xdeadbeef)).toBe('\u22120xdeadbeef')
    expect(format(' #x')(0xdeadbeef)).toBe(' 0xdeadbeef')
    expect(format(' #x')(-0xdeadbeef)).toBe('\u22120xdeadbeef')
  })

  test('format("$,x") formats hexadecimal currency', () => {
    expect(format('$,x')(0xdeadbeef)).toBe('$de,adb,eef')
  })

  test('format("[.precision]x") always has precision zero', () => {
    expect(format('.2x')(0xdeadbeef)).toBe('deadbeef')
    expect(format('.2x')(-4.2)).toBe('\u22124')
  })

  test('format("x") rounds non-integers', () => {
    expect(format('x')(2.4)).toBe('2')
  })

  test('format("x") can format negative zero as zero', () => {
    expect(format('x')(-0)).toBe('0')
    expect(format('x')(-1e-12)).toBe('0')
  })

  test('format("x") does not consider -0xeee to be positive', () => {
    expect(format('x')(-0xeee)).toBe('\u2212eee')
  })

  test('format("X") returns the expected hexadecimal (uppercase) string', () => {
    expect(format('X')(0xdeadbeef)).toBe('DEADBEEF')
  })

  test('format("#X") returns the expected hexadecimal (uppercase) string with prefix', () => {
    expect(format('#X')(0xdeadbeef)).toBe('0xDEADBEEF')
  })

  test('format("X") can format negative zero as zero', () => {
    expect(format('X')(-0)).toBe('0')
    expect(format('X')(-1e-12)).toBe('0')
  })

  test('format("X") does not consider -0xeee to be positive', () => {
    expect(format('X')(-0xeee)).toBe('\u2212EEE')
  })

  test('format("#[width]x") considers the prefix', () => {
    expect(format('20x')(0xdeadbeef)).toBe('            deadbeef')
    expect(format('#20x')(0xdeadbeef)).toBe('          0xdeadbeef')
    expect(format('020x')(0xdeadbeef)).toBe('000000000000deadbeef')
    expect(format('#020x')(0xdeadbeef)).toBe('0x0000000000deadbeef')
  })
})
