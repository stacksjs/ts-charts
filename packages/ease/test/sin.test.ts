import { describe, expect, it } from 'bun:test'
import { easeSin, easeSinIn, easeSinInOut, easeSinOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeSin', () => {
  it('easeSin is an alias for easeSinInOut', () => {
    expect(easeSin).toBe(easeSinInOut)
  })

  it('easeSinIn(t) returns the expected results', () => {
    expect(easeSinIn(0.0)).toBe(0.000000)
    assertInDelta(easeSinIn(0.1), 0.012312)
    assertInDelta(easeSinIn(0.2), 0.048943)
    assertInDelta(easeSinIn(0.3), 0.108993)
    assertInDelta(easeSinIn(0.4), 0.190983)
    assertInDelta(easeSinIn(0.5), 0.292893)
    assertInDelta(easeSinIn(0.6), 0.412215)
    assertInDelta(easeSinIn(0.7), 0.546010)
    assertInDelta(easeSinIn(0.8), 0.690983)
    assertInDelta(easeSinIn(0.9), 0.843566)
    expect(easeSinIn(1.0)).toBe(1.000000)
  })

  it('easeSinIn(t) coerces t to a number', () => {
    expect(easeSinIn('.9' as any)).toBe(easeSinIn(0.9))
    expect(easeSinIn({ valueOf() { return 0.9 } } as any)).toBe(easeSinIn(0.9))
  })

  it('easeSinOut(t) returns the expected results', () => {
    const sinOutFn = out(easeSinIn)
    assertInDelta(easeSinOut(0.0), sinOutFn(0.0))
    assertInDelta(easeSinOut(0.1), sinOutFn(0.1))
    assertInDelta(easeSinOut(0.2), sinOutFn(0.2))
    assertInDelta(easeSinOut(0.3), sinOutFn(0.3))
    assertInDelta(easeSinOut(0.4), sinOutFn(0.4))
    assertInDelta(easeSinOut(0.5), sinOutFn(0.5))
    assertInDelta(easeSinOut(0.6), sinOutFn(0.6))
    assertInDelta(easeSinOut(0.7), sinOutFn(0.7))
    assertInDelta(easeSinOut(0.8), sinOutFn(0.8))
    assertInDelta(easeSinOut(0.9), sinOutFn(0.9))
    assertInDelta(easeSinOut(1.0), sinOutFn(1.0))
  })

  it('easeSinOut(t) coerces t to a number', () => {
    expect(easeSinOut('.9' as any)).toBe(easeSinOut(0.9))
    expect(easeSinOut({ valueOf() { return 0.9 } } as any)).toBe(easeSinOut(0.9))
  })

  it('easeSinInOut(t) returns the expected results', () => {
    const sinInOutFn = inOut(easeSinIn)
    assertInDelta(easeSinInOut(0.0), sinInOutFn(0.0))
    assertInDelta(easeSinInOut(0.1), sinInOutFn(0.1))
    assertInDelta(easeSinInOut(0.2), sinInOutFn(0.2))
    assertInDelta(easeSinInOut(0.3), sinInOutFn(0.3))
    assertInDelta(easeSinInOut(0.4), sinInOutFn(0.4))
    assertInDelta(easeSinInOut(0.5), sinInOutFn(0.5))
    assertInDelta(easeSinInOut(0.6), sinInOutFn(0.6))
    assertInDelta(easeSinInOut(0.7), sinInOutFn(0.7))
    assertInDelta(easeSinInOut(0.8), sinInOutFn(0.8))
    assertInDelta(easeSinInOut(0.9), sinInOutFn(0.9))
    assertInDelta(easeSinInOut(1.0), sinInOutFn(1.0))
  })

  it('easeSinInOut(t) coerces t to a number', () => {
    expect(easeSinInOut('.9' as any)).toBe(easeSinInOut(0.9))
    expect(easeSinInOut({ valueOf() { return 0.9 } } as any)).toBe(easeSinInOut(0.9))
  })
})
