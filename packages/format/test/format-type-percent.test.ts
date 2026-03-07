import { describe, expect, test } from 'bun:test'
import { format } from '../src/index.ts'

describe('format type %', () => {
  test('format("%") can output a whole percentage', () => {
    const f = format('.0%')
    expect(f(0)).toBe('0%')
    expect(f(0.042)).toBe('4%')
    expect(f(0.42)).toBe('42%')
    expect(f(4.2)).toBe('420%')
    expect(f(-.042)).toBe('\u22124%')
    expect(f(-.42)).toBe('\u221242%')
    expect(f(-4.2)).toBe('\u2212420%')
  })

  test('format(".%") can output a percentage with precision', () => {
    const f1 = format('.1%')
    expect(f1(0.234)).toBe('23.4%')
    const f2 = format('.2%')
    expect(f2(0.234)).toBe('23.40%')
  })

  test('format("%") fill respects suffix', () => {
    expect(format('020.0%')(42)).toBe('0000000000000004200%')
    expect(format('20.0%')(42)).toBe('               4200%')
  })

  test('format("^%") align center puts suffix adjacent to number', () => {
    expect(format('^21.0%')(0.42)).toBe('         42%         ')
    expect(format('^21,.0%')(422)).toBe('       42,200%       ')
    expect(format('^21,.0%')(-422)).toBe('      \u221242,200%       ')
  })
})
