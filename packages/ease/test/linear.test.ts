import { describe, expect, it } from 'bun:test'
import { easeLinear } from '../src/index.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeLinear', () => {
  it('easeLinear(t) returns the expected results', () => {
    expect(easeLinear(0.0)).toBe(0.0)
    assertInDelta(easeLinear(0.1), 0.1)
    assertInDelta(easeLinear(0.2), 0.2)
    assertInDelta(easeLinear(0.3), 0.3)
    assertInDelta(easeLinear(0.4), 0.4)
    assertInDelta(easeLinear(0.5), 0.5)
    assertInDelta(easeLinear(0.6), 0.6)
    assertInDelta(easeLinear(0.7), 0.7)
    assertInDelta(easeLinear(0.8), 0.8)
    assertInDelta(easeLinear(0.9), 0.9)
    expect(easeLinear(1.0)).toBe(1.0)
  })

  it('easeLinear(t) coerces t to a number', () => {
    expect(easeLinear('.9' as any)).toBe(easeLinear(0.9))
    expect(easeLinear({ valueOf() { return 0.9 } } as any)).toBe(easeLinear(0.9))
  })
})
