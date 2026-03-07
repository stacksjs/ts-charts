import { describe, expect, it } from 'bun:test'
import { easeCircle, easeCircleIn, easeCircleInOut, easeCircleOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeCircle', () => {
  it('easeCircle is an alias for easeCircleInOut', () => {
    expect(easeCircle).toBe(easeCircleInOut)
  })

  it('easeCircleIn(t) returns the expected results', () => {
    expect(easeCircleIn(0.0)).toBe(0.000000)
    assertInDelta(easeCircleIn(0.1), 0.005013)
    assertInDelta(easeCircleIn(0.2), 0.020204)
    assertInDelta(easeCircleIn(0.3), 0.046061)
    assertInDelta(easeCircleIn(0.4), 0.083485)
    assertInDelta(easeCircleIn(0.5), 0.133975)
    assertInDelta(easeCircleIn(0.6), 0.200000)
    assertInDelta(easeCircleIn(0.7), 0.285857)
    assertInDelta(easeCircleIn(0.8), 0.400000)
    assertInDelta(easeCircleIn(0.9), 0.564110)
    expect(easeCircleIn(1.0)).toBe(1.000000)
  })

  it('easeCircleIn(t) coerces t to a number', () => {
    expect(easeCircleIn('.9' as any)).toBe(easeCircleIn(0.9))
    expect(easeCircleIn({ valueOf() { return 0.9 } } as any)).toBe(easeCircleIn(0.9))
  })

  it('easeCircleOut(t) returns the expected results', () => {
    const circleOutFn = out(easeCircleIn)
    expect(easeCircleOut(0.0)).toBe(circleOutFn(0.0))
    assertInDelta(easeCircleOut(0.1), circleOutFn(0.1))
    assertInDelta(easeCircleOut(0.2), circleOutFn(0.2))
    assertInDelta(easeCircleOut(0.3), circleOutFn(0.3))
    assertInDelta(easeCircleOut(0.4), circleOutFn(0.4))
    assertInDelta(easeCircleOut(0.5), circleOutFn(0.5))
    assertInDelta(easeCircleOut(0.6), circleOutFn(0.6))
    assertInDelta(easeCircleOut(0.7), circleOutFn(0.7))
    assertInDelta(easeCircleOut(0.8), circleOutFn(0.8))
    assertInDelta(easeCircleOut(0.9), circleOutFn(0.9))
    expect(easeCircleOut(1.0)).toBe(circleOutFn(1.0))
  })

  it('easeCircleOut(t) coerces t to a number', () => {
    expect(easeCircleOut('.9' as any)).toBe(easeCircleOut(0.9))
    expect(easeCircleOut({ valueOf() { return 0.9 } } as any)).toBe(easeCircleOut(0.9))
  })

  it('easeCircleInOut(t) returns the expected results', () => {
    const circleInOutFn = inOut(easeCircleIn)
    expect(easeCircleInOut(0.0)).toBe(circleInOutFn(0.0))
    assertInDelta(easeCircleInOut(0.1), circleInOutFn(0.1))
    assertInDelta(easeCircleInOut(0.2), circleInOutFn(0.2))
    assertInDelta(easeCircleInOut(0.3), circleInOutFn(0.3))
    assertInDelta(easeCircleInOut(0.4), circleInOutFn(0.4))
    assertInDelta(easeCircleInOut(0.5), circleInOutFn(0.5))
    assertInDelta(easeCircleInOut(0.6), circleInOutFn(0.6))
    assertInDelta(easeCircleInOut(0.7), circleInOutFn(0.7))
    assertInDelta(easeCircleInOut(0.8), circleInOutFn(0.8))
    assertInDelta(easeCircleInOut(0.9), circleInOutFn(0.9))
    expect(easeCircleInOut(1.0)).toBe(circleInOutFn(1.0))
  })

  it('easeCircleInOut(t) coerces t to a number', () => {
    expect(easeCircleInOut('.9' as any)).toBe(easeCircleInOut(0.9))
    expect(easeCircleInOut({ valueOf() { return 0.9 } } as any)).toBe(easeCircleInOut(0.9))
  })
})
