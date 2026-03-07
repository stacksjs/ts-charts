import { describe, expect, it } from 'bun:test'
import { easeCubic, easeCubicIn, easeCubicInOut, easeCubicOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeCubic', () => {
  it('easeCubic is an alias for easeCubicInOut', () => {
    expect(easeCubic).toBe(easeCubicInOut)
  })

  it('easeCubicIn(t) returns the expected results', () => {
    expect(easeCubicIn(0.0)).toBe(0.000)
    assertInDelta(easeCubicIn(0.1), 0.001)
    assertInDelta(easeCubicIn(0.2), 0.008)
    assertInDelta(easeCubicIn(0.3), 0.027)
    assertInDelta(easeCubicIn(0.4), 0.064)
    assertInDelta(easeCubicIn(0.5), 0.125)
    assertInDelta(easeCubicIn(0.6), 0.216)
    assertInDelta(easeCubicIn(0.7), 0.343)
    assertInDelta(easeCubicIn(0.8), 0.512)
    assertInDelta(easeCubicIn(0.9), 0.729)
    expect(easeCubicIn(1.0)).toBe(1.000)
  })

  it('easeCubicIn(t) coerces t to a number', () => {
    expect(easeCubicIn('.9' as any)).toBe(easeCubicIn(0.9))
    expect(easeCubicIn({ valueOf() { return 0.9 } } as any)).toBe(easeCubicIn(0.9))
  })

  it('easeCubicOut(t) returns the expected results', () => {
    const cubicOut = out(easeCubicIn)
    expect(easeCubicOut(0.0)).toBe(cubicOut(0.0))
    assertInDelta(easeCubicOut(0.1), cubicOut(0.1))
    assertInDelta(easeCubicOut(0.2), cubicOut(0.2))
    assertInDelta(easeCubicOut(0.3), cubicOut(0.3))
    assertInDelta(easeCubicOut(0.4), cubicOut(0.4))
    assertInDelta(easeCubicOut(0.5), cubicOut(0.5))
    assertInDelta(easeCubicOut(0.6), cubicOut(0.6))
    assertInDelta(easeCubicOut(0.7), cubicOut(0.7))
    assertInDelta(easeCubicOut(0.8), cubicOut(0.8))
    assertInDelta(easeCubicOut(0.9), cubicOut(0.9))
    expect(easeCubicOut(1.0)).toBe(cubicOut(1.0))
  })

  it('easeCubicOut(t) coerces t to a number', () => {
    expect(easeCubicOut('.9' as any)).toBe(easeCubicOut(0.9))
    expect(easeCubicOut({ valueOf() { return 0.9 } } as any)).toBe(easeCubicOut(0.9))
  })

  it('easeCubicInOut(t) returns the expected results', () => {
    const cubicInOut = inOut(easeCubicIn)
    expect(easeCubicInOut(0.0)).toBe(cubicInOut(0.0))
    assertInDelta(easeCubicInOut(0.1), cubicInOut(0.1))
    assertInDelta(easeCubicInOut(0.2), cubicInOut(0.2))
    assertInDelta(easeCubicInOut(0.3), cubicInOut(0.3))
    assertInDelta(easeCubicInOut(0.4), cubicInOut(0.4))
    assertInDelta(easeCubicInOut(0.5), cubicInOut(0.5))
    assertInDelta(easeCubicInOut(0.6), cubicInOut(0.6))
    assertInDelta(easeCubicInOut(0.7), cubicInOut(0.7))
    assertInDelta(easeCubicInOut(0.8), cubicInOut(0.8))
    assertInDelta(easeCubicInOut(0.9), cubicInOut(0.9))
    expect(easeCubicInOut(1.0)).toBe(cubicInOut(1.0))
  })

  it('easeCubicInOut(t) coerces t to a number', () => {
    expect(easeCubicInOut('.9' as any)).toBe(easeCubicInOut(0.9))
    expect(easeCubicInOut({ valueOf() { return 0.9 } } as any)).toBe(easeCubicInOut(0.9))
  })
})
