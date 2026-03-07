import { describe, expect, it } from 'bun:test'
import { easePoly, easePolyIn, easePolyInOut, easePolyOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easePoly', () => {
  it('easePoly is an alias for easePolyInOut', () => {
    expect(easePoly).toBe(easePolyInOut)
  })

  it('easePolyIn(t) returns the expected results', () => {
    expect(easePolyIn(0.0)).toBe(0.000)
    assertInDelta(easePolyIn(0.1), 0.001)
    assertInDelta(easePolyIn(0.2), 0.008)
    assertInDelta(easePolyIn(0.3), 0.027)
    assertInDelta(easePolyIn(0.4), 0.064)
    assertInDelta(easePolyIn(0.5), 0.125)
    assertInDelta(easePolyIn(0.6), 0.216)
    assertInDelta(easePolyIn(0.7), 0.343)
    assertInDelta(easePolyIn(0.8), 0.512)
    assertInDelta(easePolyIn(0.9), 0.729)
    expect(easePolyIn(1.0)).toBe(1.000)
  })

  it('easePolyIn(t) coerces t to a number', () => {
    expect(easePolyIn('.9' as any)).toBe(easePolyIn(0.9))
    expect(easePolyIn({ valueOf() { return 0.9 } } as any)).toBe(easePolyIn(0.9))
  })

  it('easePolyIn(t) is the same as polyIn.exponent(3)(t)', () => {
    expect(easePolyIn(0.1)).toBe(easePolyIn.exponent(3)(0.1))
    expect(easePolyIn(0.2)).toBe(easePolyIn.exponent(3)(0.2))
    expect(easePolyIn(0.3)).toBe(easePolyIn.exponent(3)(0.3))
  })

  it('easePolyIn.exponent(e)(t) coerces t and e to numbers', () => {
    expect(easePolyIn.exponent(1.3 as any)('.9' as any)).toBe(easePolyIn.exponent(1.3)(0.9))
    expect(easePolyIn.exponent({ valueOf() { return 1.3 } } as any)({ valueOf() { return 0.9 } } as any)).toBe(easePolyIn.exponent(1.3)(0.9))
  })

  it('easePolyIn.exponent(2.5)(t) returns the expected results', () => {
    expect(easePolyIn.exponent(2.5)(0.0)).toBe(0.000000)
    assertInDelta(easePolyIn.exponent(2.5)(0.1), 0.003162)
    assertInDelta(easePolyIn.exponent(2.5)(0.2), 0.017889)
    assertInDelta(easePolyIn.exponent(2.5)(0.3), 0.049295)
    assertInDelta(easePolyIn.exponent(2.5)(0.4), 0.101193)
    assertInDelta(easePolyIn.exponent(2.5)(0.5), 0.176777)
    assertInDelta(easePolyIn.exponent(2.5)(0.6), 0.278855)
    assertInDelta(easePolyIn.exponent(2.5)(0.7), 0.409963)
    assertInDelta(easePolyIn.exponent(2.5)(0.8), 0.572433)
    assertInDelta(easePolyIn.exponent(2.5)(0.9), 0.768433)
    expect(easePolyIn.exponent(2.5)(1.0)).toBe(1.000000)
  })

  it('easePolyOut.exponent(e)(t) coerces t and e to numbers', () => {
    expect(easePolyOut.exponent(1.3 as any)('.9' as any)).toBe(easePolyOut.exponent(1.3)(0.9))
    expect(easePolyOut.exponent({ valueOf() { return 1.3 } } as any)({ valueOf() { return 0.9 } } as any)).toBe(easePolyOut.exponent(1.3)(0.9))
  })

  it('easePolyOut(t) is the same as polyOut.exponent(3)(t)', () => {
    expect(easePolyOut(0.1)).toBe(easePolyOut.exponent(3)(0.1))
    expect(easePolyOut(0.2)).toBe(easePolyOut.exponent(3)(0.2))
    expect(easePolyOut(0.3)).toBe(easePolyOut.exponent(3)(0.3))
  })

  it('easePolyOut(t, null) is the same as polyOut.exponent(3)(t)', () => {
    expect(easePolyOut(0.1)).toBe(easePolyOut.exponent(3)(0.1))
    expect(easePolyOut(0.2)).toBe(easePolyOut.exponent(3)(0.2))
    expect(easePolyOut(0.3)).toBe(easePolyOut.exponent(3)(0.3))
  })

  it('easePolyOut(t, undefined) is the same as polyOut.exponent(3)(t)', () => {
    expect(easePolyOut(0.1)).toBe(easePolyOut.exponent(3)(0.1))
    expect(easePolyOut(0.2)).toBe(easePolyOut.exponent(3)(0.2))
    expect(easePolyOut(0.3)).toBe(easePolyOut.exponent(3)(0.3))
  })

  it('easePolyOut.exponent(2.5)(t) returns the expected results', () => {
    const polyOutFn = out(easePolyIn.exponent(2.5))
    expect(easePolyOut.exponent(2.5)(0.0)).toBe(polyOutFn(0.0))
    assertInDelta(easePolyOut.exponent(2.5)(0.1), polyOutFn(0.1))
    assertInDelta(easePolyOut.exponent(2.5)(0.2), polyOutFn(0.2))
    assertInDelta(easePolyOut.exponent(2.5)(0.3), polyOutFn(0.3))
    assertInDelta(easePolyOut.exponent(2.5)(0.4), polyOutFn(0.4))
    assertInDelta(easePolyOut.exponent(2.5)(0.5), polyOutFn(0.5))
    assertInDelta(easePolyOut.exponent(2.5)(0.6), polyOutFn(0.6))
    assertInDelta(easePolyOut.exponent(2.5)(0.7), polyOutFn(0.7))
    assertInDelta(easePolyOut.exponent(2.5)(0.8), polyOutFn(0.8))
    assertInDelta(easePolyOut.exponent(2.5)(0.9), polyOutFn(0.9))
    expect(easePolyOut.exponent(2.5)(1.0)).toBe(polyOutFn(1.0))
  })

  it('easePolyInOut.exponent(e)(t) coerces t and e to numbers', () => {
    expect(easePolyInOut.exponent(1.3 as any)('.9' as any)).toBe(easePolyInOut.exponent(1.3)(0.9))
    expect(easePolyInOut.exponent({ valueOf() { return 1.3 } } as any)({ valueOf() { return 0.9 } } as any)).toBe(easePolyInOut.exponent(1.3)(0.9))
  })

  it('easePolyInOut(t) is the same as polyInOut.exponent(3)(t)', () => {
    expect(easePolyInOut(0.1)).toBe(easePolyInOut.exponent(3)(0.1))
    expect(easePolyInOut(0.2)).toBe(easePolyInOut.exponent(3)(0.2))
    expect(easePolyInOut(0.3)).toBe(easePolyInOut.exponent(3)(0.3))
  })

  it('easePolyInOut.exponent(2.5)(t) returns the expected results', () => {
    const polyInOutFn = inOut(easePolyIn.exponent(2.5))
    assertInDelta(easePolyInOut.exponent(2.5)(0.0), polyInOutFn(0.0))
    assertInDelta(easePolyInOut.exponent(2.5)(0.1), polyInOutFn(0.1))
    assertInDelta(easePolyInOut.exponent(2.5)(0.2), polyInOutFn(0.2))
    assertInDelta(easePolyInOut.exponent(2.5)(0.3), polyInOutFn(0.3))
    assertInDelta(easePolyInOut.exponent(2.5)(0.4), polyInOutFn(0.4))
    assertInDelta(easePolyInOut.exponent(2.5)(0.5), polyInOutFn(0.5))
    assertInDelta(easePolyInOut.exponent(2.5)(0.6), polyInOutFn(0.6))
    assertInDelta(easePolyInOut.exponent(2.5)(0.7), polyInOutFn(0.7))
    assertInDelta(easePolyInOut.exponent(2.5)(0.8), polyInOutFn(0.8))
    assertInDelta(easePolyInOut.exponent(2.5)(0.9), polyInOutFn(0.9))
    assertInDelta(easePolyInOut.exponent(2.5)(1.0), polyInOutFn(1.0))
  })
})
