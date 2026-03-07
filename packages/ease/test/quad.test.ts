import { describe, expect, it } from 'bun:test'
import { easeQuad, easeQuadIn, easeQuadInOut, easeQuadOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeQuad', () => {
  it('easeQuad is an alias for easeQuadInOut', () => {
    expect(easeQuad).toBe(easeQuadInOut)
  })

  it('easeQuadIn(t) returns the expected results', () => {
    expect(easeQuadIn(0.0)).toBe(0.00)
    assertInDelta(easeQuadIn(0.1), 0.01)
    assertInDelta(easeQuadIn(0.2), 0.04)
    assertInDelta(easeQuadIn(0.3), 0.09)
    assertInDelta(easeQuadIn(0.4), 0.16)
    assertInDelta(easeQuadIn(0.5), 0.25)
    assertInDelta(easeQuadIn(0.6), 0.36)
    assertInDelta(easeQuadIn(0.7), 0.49)
    assertInDelta(easeQuadIn(0.8), 0.64)
    assertInDelta(easeQuadIn(0.9), 0.81)
    expect(easeQuadIn(1.0)).toBe(1.00)
  })

  it('easeQuadIn(t) coerces t to a number', () => {
    expect(easeQuadIn('.9' as any)).toBe(easeQuadIn(0.9))
    expect(easeQuadIn({ valueOf() { return 0.9 } } as any)).toBe(easeQuadIn(0.9))
  })

  it('easeQuadOut(t) returns the expected results', () => {
    const quadOut = out(easeQuadIn)
    assertInDelta(easeQuadOut(0.0), quadOut(0.0))
    assertInDelta(easeQuadOut(0.1), quadOut(0.1))
    assertInDelta(easeQuadOut(0.2), quadOut(0.2))
    assertInDelta(easeQuadOut(0.3), quadOut(0.3))
    assertInDelta(easeQuadOut(0.4), quadOut(0.4))
    assertInDelta(easeQuadOut(0.5), quadOut(0.5))
    assertInDelta(easeQuadOut(0.6), quadOut(0.6))
    assertInDelta(easeQuadOut(0.7), quadOut(0.7))
    assertInDelta(easeQuadOut(0.8), quadOut(0.8))
    assertInDelta(easeQuadOut(0.9), quadOut(0.9))
    assertInDelta(easeQuadOut(1.0), quadOut(1.0))
  })

  it('easeQuadOut(t) coerces t to a number', () => {
    expect(easeQuadOut('.9' as any)).toBe(easeQuadOut(0.9))
    expect(easeQuadOut({ valueOf() { return 0.9 } } as any)).toBe(easeQuadOut(0.9))
  })

  it('easeQuadInOut(t) returns the expected results', () => {
    const quadInOut = inOut(easeQuadIn)
    assertInDelta(easeQuadInOut(0.0), quadInOut(0.0))
    assertInDelta(easeQuadInOut(0.1), quadInOut(0.1))
    assertInDelta(easeQuadInOut(0.2), quadInOut(0.2))
    assertInDelta(easeQuadInOut(0.3), quadInOut(0.3))
    assertInDelta(easeQuadInOut(0.4), quadInOut(0.4))
    assertInDelta(easeQuadInOut(0.5), quadInOut(0.5))
    assertInDelta(easeQuadInOut(0.6), quadInOut(0.6))
    assertInDelta(easeQuadInOut(0.7), quadInOut(0.7))
    assertInDelta(easeQuadInOut(0.8), quadInOut(0.8))
    assertInDelta(easeQuadInOut(0.9), quadInOut(0.9))
    assertInDelta(easeQuadInOut(1.0), quadInOut(1.0))
  })

  it('easeQuadInOut(t) coerces t to a number', () => {
    expect(easeQuadInOut('.9' as any)).toBe(easeQuadInOut(0.9))
    expect(easeQuadInOut({ valueOf() { return 0.9 } } as any)).toBe(easeQuadInOut(0.9))
  })
})
