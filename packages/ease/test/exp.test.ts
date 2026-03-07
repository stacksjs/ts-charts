import { describe, expect, it } from 'bun:test'
import { easeExp, easeExpIn, easeExpInOut, easeExpOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeExp', () => {
  it('easeExp is an alias for easeExpInOut', () => {
    expect(easeExp).toBe(easeExpInOut)
  })

  it('easeExpIn(t) returns the expected results', () => {
    expect(easeExpIn(0.0)).toBe(0.000000)
    assertInDelta(easeExpIn(0.1), 0.000978)
    assertInDelta(easeExpIn(0.2), 0.002933)
    assertInDelta(easeExpIn(0.3), 0.006843)
    assertInDelta(easeExpIn(0.4), 0.014663)
    assertInDelta(easeExpIn(0.5), 0.030303)
    assertInDelta(easeExpIn(0.6), 0.061584)
    assertInDelta(easeExpIn(0.7), 0.124145)
    assertInDelta(easeExpIn(0.8), 0.249267)
    assertInDelta(easeExpIn(0.9), 0.499511)
    expect(easeExpIn(1.0)).toBe(1.000000)
  })

  it('easeExpIn(t) coerces t to a number', () => {
    expect(easeExpIn('.9' as any)).toBe(easeExpIn(0.9))
    expect(easeExpIn({ valueOf() { return 0.9 } } as any)).toBe(easeExpIn(0.9))
  })

  it('easeExpOut(t) returns the expected results', () => {
    const expOutFn = out(easeExpIn)
    assertInDelta(easeExpOut(0.0), expOutFn(0.0))
    assertInDelta(easeExpOut(0.1), expOutFn(0.1))
    assertInDelta(easeExpOut(0.2), expOutFn(0.2))
    assertInDelta(easeExpOut(0.3), expOutFn(0.3))
    assertInDelta(easeExpOut(0.4), expOutFn(0.4))
    assertInDelta(easeExpOut(0.5), expOutFn(0.5))
    assertInDelta(easeExpOut(0.6), expOutFn(0.6))
    assertInDelta(easeExpOut(0.7), expOutFn(0.7))
    assertInDelta(easeExpOut(0.8), expOutFn(0.8))
    assertInDelta(easeExpOut(0.9), expOutFn(0.9))
    assertInDelta(easeExpOut(1.0), expOutFn(1.0))
  })

  it('easeExpOut(t) coerces t to a number', () => {
    expect(easeExpOut('.9' as any)).toBe(easeExpOut(0.9))
    expect(easeExpOut({ valueOf() { return 0.9 } } as any)).toBe(easeExpOut(0.9))
  })

  it('easeExpInOut(t) returns the expected results', () => {
    const expInOutFn = inOut(easeExpIn)
    expect(easeExpInOut(0.0)).toBe(expInOutFn(0.0))
    assertInDelta(easeExpInOut(0.1), expInOutFn(0.1))
    assertInDelta(easeExpInOut(0.2), expInOutFn(0.2))
    assertInDelta(easeExpInOut(0.3), expInOutFn(0.3))
    assertInDelta(easeExpInOut(0.4), expInOutFn(0.4))
    assertInDelta(easeExpInOut(0.5), expInOutFn(0.5))
    assertInDelta(easeExpInOut(0.6), expInOutFn(0.6))
    assertInDelta(easeExpInOut(0.7), expInOutFn(0.7))
    assertInDelta(easeExpInOut(0.8), expInOutFn(0.8))
    assertInDelta(easeExpInOut(0.9), expInOutFn(0.9))
    expect(easeExpInOut(1.0)).toBe(expInOutFn(1.0))
  })

  it('easeExpInOut(t) coerces t to a number', () => {
    expect(easeExpInOut('.9' as any)).toBe(easeExpInOut(0.9))
    expect(easeExpInOut({ valueOf() { return 0.9 } } as any)).toBe(easeExpInOut(0.9))
  })
})
