import { describe, expect, it } from 'bun:test'
import { easeBack, easeBackIn, easeBackInOut, easeBackOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeBack', () => {
  it('easeBack is an alias for easeBackInOut', () => {
    expect(easeBack).toBe(easeBackInOut)
  })

  it('easeBackIn(t) returns the expected results', () => {
    expect(Math.abs(easeBackIn(0.0))).toBe(0.000000)
    assertInDelta(easeBackIn(0.1), -0.014314)
    assertInDelta(easeBackIn(0.2), -0.046451)
    assertInDelta(easeBackIn(0.3), -0.080200)
    assertInDelta(easeBackIn(0.4), -0.099352)
    assertInDelta(easeBackIn(0.5), -0.087698)
    assertInDelta(easeBackIn(0.6), -0.029028)
    assertInDelta(easeBackIn(0.7), +0.092868)
    assertInDelta(easeBackIn(0.8), +0.294198)
    assertInDelta(easeBackIn(0.9), +0.591172)
    expect(easeBackIn(1.0)).toBe(+1.000000)
  })

  it('easeBackIn(t) coerces t to a number', () => {
    expect(easeBackIn('.9' as any)).toBe(easeBackIn(0.9))
    expect(easeBackIn({ valueOf() { return 0.9 } } as any)).toBe(easeBackIn(0.9))
  })

  it('easeBackOut(t) returns the expected results', () => {
    const backOutFn = out(easeBackIn)
    expect(easeBackOut(0.0)).toBe(backOutFn(0.0))
    assertInDelta(easeBackOut(0.1), backOutFn(0.1))
    assertInDelta(easeBackOut(0.2), backOutFn(0.2))
    assertInDelta(easeBackOut(0.3), backOutFn(0.3))
    assertInDelta(easeBackOut(0.4), backOutFn(0.4))
    assertInDelta(easeBackOut(0.5), backOutFn(0.5))
    assertInDelta(easeBackOut(0.6), backOutFn(0.6))
    assertInDelta(easeBackOut(0.7), backOutFn(0.7))
    assertInDelta(easeBackOut(0.8), backOutFn(0.8))
    assertInDelta(easeBackOut(0.9), backOutFn(0.9))
    expect(easeBackOut(1.0)).toBe(backOutFn(1.0))
  })

  it('easeBackOut(t) coerces t to a number', () => {
    expect(easeBackOut('.9' as any)).toBe(easeBackOut(0.9))
    expect(easeBackOut({ valueOf() { return 0.9 } } as any)).toBe(easeBackOut(0.9))
  })

  it('easeBackInOut(t) returns the expected results', () => {
    const backInOutFn = inOut(easeBackIn)
    expect(easeBackInOut(0.0)).toBe(backInOutFn(0.0))
    assertInDelta(easeBackInOut(0.1), backInOutFn(0.1))
    assertInDelta(easeBackInOut(0.2), backInOutFn(0.2))
    assertInDelta(easeBackInOut(0.3), backInOutFn(0.3))
    assertInDelta(easeBackInOut(0.4), backInOutFn(0.4))
    assertInDelta(easeBackInOut(0.5), backInOutFn(0.5))
    assertInDelta(easeBackInOut(0.6), backInOutFn(0.6))
    assertInDelta(easeBackInOut(0.7), backInOutFn(0.7))
    assertInDelta(easeBackInOut(0.8), backInOutFn(0.8))
    assertInDelta(easeBackInOut(0.9), backInOutFn(0.9))
    expect(easeBackInOut(1.0)).toBe(backInOutFn(1.0))
  })

  it('easeBackInOut(t) coerces t to a number', () => {
    expect(easeBackInOut('.9' as any)).toBe(easeBackInOut(0.9))
    expect(easeBackInOut({ valueOf() { return 0.9 } } as any)).toBe(easeBackInOut(0.9))
  })
})
