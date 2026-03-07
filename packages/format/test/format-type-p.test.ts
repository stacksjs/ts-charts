import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type p', () => {
  test('format("p") can output a percentage', () => {
    const f = format('p')
    expect(f(.00123)).toBe('0.123000%')
    expect(f(.0123)).toBe('1.23000%')
    expect(f(.123)).toBe('12.3000%')
    expect(f(.234)).toBe('23.4000%')
    expect(f(1.23)).toBe('123.000%')
    expect(f(-.00123)).toBe('\u22120.123000%')
    expect(f(-.0123)).toBe('\u22121.23000%')
    expect(f(-.123)).toBe('\u221212.3000%')
    expect(f(-1.23)).toBe('\u2212123.000%')
  })

  test('format("+p") can output a percentage with rounding and sign', () => {
    const f = format('+.2p')
    expect(f(.00123)).toBe('+0.12%')
    expect(f(.0123)).toBe('+1.2%')
    expect(f(.123)).toBe('+12%')
    expect(f(1.23)).toBe('+120%')
    expect(f(-.00123)).toBe('\u22120.12%')
    expect(f(-.0123)).toBe('\u22121.2%')
    expect(f(-.123)).toBe('\u221212%')
    expect(f(-1.23)).toBe('\u2212120%')
  })
})
