import { describe, expect, it } from 'bun:test'
import { easeBounce, easeBounceIn, easeBounceInOut, easeBounceOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeBounce', () => {
  it('easeBounce is an alias for easeBounceOut', () => {
    expect(easeBounce).toBe(easeBounceOut)
  })

  it('easeBounceIn(t) returns the expected results', () => {
    expect(easeBounceIn(0.0)).toBe(0.000000)
    assertInDelta(easeBounceIn(0.1), 0.011875)
    assertInDelta(easeBounceIn(0.2), 0.060000)
    assertInDelta(easeBounceIn(0.3), 0.069375)
    assertInDelta(easeBounceIn(0.4), 0.227500)
    assertInDelta(easeBounceIn(0.5), 0.234375)
    assertInDelta(easeBounceIn(0.6), 0.090000)
    assertInDelta(easeBounceIn(0.7), 0.319375)
    assertInDelta(easeBounceIn(0.8), 0.697500)
    assertInDelta(easeBounceIn(0.9), 0.924375)
    expect(easeBounceIn(1.0)).toBe(1.000000)
  })

  it('easeBounceIn(t) coerces t to a number', () => {
    expect(easeBounceIn('.9' as any)).toBe(easeBounceIn(0.9))
    expect(easeBounceIn({ valueOf() { return 0.9 } } as any)).toBe(easeBounceIn(0.9))
  })

  it('easeBounceOut(t) returns the expected results', () => {
    const bounceOutFn = out(easeBounceIn)
    expect(easeBounceOut(0.0)).toBe(bounceOutFn(0.0))
    assertInDelta(easeBounceOut(0.1), bounceOutFn(0.1))
    assertInDelta(easeBounceOut(0.2), bounceOutFn(0.2))
    assertInDelta(easeBounceOut(0.3), bounceOutFn(0.3))
    assertInDelta(easeBounceOut(0.4), bounceOutFn(0.4))
    assertInDelta(easeBounceOut(0.5), bounceOutFn(0.5))
    assertInDelta(easeBounceOut(0.6), bounceOutFn(0.6))
    assertInDelta(easeBounceOut(0.7), bounceOutFn(0.7))
    assertInDelta(easeBounceOut(0.8), bounceOutFn(0.8))
    assertInDelta(easeBounceOut(0.9), bounceOutFn(0.9))
    expect(easeBounceOut(1.0)).toBe(bounceOutFn(1.0))
  })

  it('easeBounceOut(t) coerces t to a number', () => {
    expect(easeBounceOut('.9' as any)).toBe(easeBounceOut(0.9))
    expect(easeBounceOut({ valueOf() { return 0.9 } } as any)).toBe(easeBounceOut(0.9))
  })

  it('easeBounceInOut(t) returns the expected results', () => {
    const bounceInOutFn = inOut(easeBounceIn)
    expect(easeBounceInOut(0.0)).toBe(bounceInOutFn(0.0))
    assertInDelta(easeBounceInOut(0.1), bounceInOutFn(0.1))
    assertInDelta(easeBounceInOut(0.2), bounceInOutFn(0.2))
    assertInDelta(easeBounceInOut(0.3), bounceInOutFn(0.3))
    assertInDelta(easeBounceInOut(0.4), bounceInOutFn(0.4))
    assertInDelta(easeBounceInOut(0.5), bounceInOutFn(0.5))
    assertInDelta(easeBounceInOut(0.6), bounceInOutFn(0.6))
    assertInDelta(easeBounceInOut(0.7), bounceInOutFn(0.7))
    assertInDelta(easeBounceInOut(0.8), bounceInOutFn(0.8))
    assertInDelta(easeBounceInOut(0.9), bounceInOutFn(0.9))
    expect(easeBounceInOut(1.0)).toBe(bounceInOutFn(1.0))
  })

  it('easeBounceInOut(t) coerces t to a number', () => {
    expect(easeBounceInOut('.9' as any)).toBe(easeBounceInOut(0.9))
    expect(easeBounceInOut({ valueOf() { return 0.9 } } as any)).toBe(easeBounceInOut(0.9))
  })
})
