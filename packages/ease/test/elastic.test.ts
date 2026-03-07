import { describe, expect, it } from 'bun:test'
import { easeElastic, easeElasticIn, easeElasticInOut, easeElasticOut } from '../src/index.ts'
import { out, inOut } from './generic.ts'

function assertInDelta(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(1e-6)
}

describe('easeElastic', () => {
  it('easeElastic is an alias for easeElasticOut', () => {
    expect(easeElastic).toBe(easeElasticOut)
  })

  it('easeElasticIn(t) returns the expected results', () => {
    expect(Math.abs(easeElasticIn(0.0))).toBe(0.000000)
    assertInDelta(easeElasticIn(0.1), 0.000978)
    assertInDelta(easeElasticIn(0.2), -0.001466)
    assertInDelta(easeElasticIn(0.3), -0.003421)
    assertInDelta(easeElasticIn(0.4), 0.014663)
    assertInDelta(easeElasticIn(0.5), -0.015152)
    assertInDelta(easeElasticIn(0.6), -0.030792)
    assertInDelta(easeElasticIn(0.7), 0.124145)
    assertInDelta(easeElasticIn(0.8), -0.124633)
    assertInDelta(easeElasticIn(0.9), -0.249756)
    expect(easeElasticIn(1.0)).toBe(1.000000)
  })

  it('easeElasticIn(t) coerces t to a number', () => {
    expect(easeElasticIn('.9' as any)).toBe(easeElasticIn(0.9))
    expect(easeElasticIn({ valueOf() { return 0.9 } } as any)).toBe(easeElasticIn(0.9))
  })

  it('easeElasticIn(t) is the same as elasticIn.amplitude(1).period(0.3)(t)', () => {
    expect(easeElasticIn(0.1)).toBe(easeElasticIn.amplitude(1).period(0.3)(0.1))
    expect(easeElasticIn(0.2)).toBe(easeElasticIn.amplitude(1).period(0.3)(0.2))
    expect(easeElasticIn(0.3)).toBe(easeElasticIn.amplitude(1).period(0.3)(0.3))
  })

  it('easeElasticIn.amplitude(a)(t) is the same as elasticIn(t) if a <= 1', () => {
    expect(easeElasticIn.amplitude(-1.0)(0.1)).toBe(easeElasticIn(0.1))
    expect(easeElasticIn.amplitude(+0.4)(0.2)).toBe(easeElasticIn(0.2))
    expect(easeElasticIn.amplitude(+0.8)(0.3)).toBe(easeElasticIn(0.3))
  })

  it('easeElasticIn.amplitude(a).period(p)(t) coerces t, a and p to numbers', () => {
    expect(easeElasticIn.amplitude(1.3 as any).period(0.2 as any)('.9' as any)).toBe(easeElasticIn.amplitude(1.3).period(0.2)(0.9))
    expect(easeElasticIn.amplitude({ valueOf() { return 1.3 } } as any).period({ valueOf() { return 0.2 } } as any)({ valueOf() { return 0.9 } } as any)).toBe(easeElasticIn.amplitude(1.3).period(0.2)(0.9))
  })

  it('easeElasticIn.amplitude(1.3)(t) returns the expected results', () => {
    expect(easeElasticIn.amplitude(1.3)(0.0)).toBe(0.000000)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.1), 0.000978)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.2), -0.003576)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.3), 0.001501)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.4), 0.014663)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.5), -0.036951)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.6), 0.013510)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.7), 0.124145)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.8), -0.303950)
    assertInDelta(easeElasticIn.amplitude(1.3)(0.9), 0.109580)
    expect(easeElasticIn.amplitude(1.3)(1.0)).toBe(1.000000)
  })

  it('easeElasticIn.amplitude(1.5).period(1)(t) returns the expected results', () => {
    expect(easeElasticIn.amplitude(1.5).period(1)(0.0)).toBe(0.000000)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.1), 0.000148)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.2), -0.002212)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.3), -0.009390)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.4), -0.021498)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.5), -0.030303)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.6), -0.009352)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.7), 0.093642)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.8), 0.342077)
    assertInDelta(easeElasticIn.amplitude(1.5).period(1)(0.9), 0.732374)
    expect(easeElasticIn.amplitude(1.5).period(1)(1.0)).toBe(1.000000)
  })

  it('easeElasticOut(t) returns the expected results', () => {
    const elasticOutFn = out(easeElasticIn)
    expect(easeElasticOut(0.0)).toBe(elasticOutFn(0.0))
    assertInDelta(easeElasticOut(0.1), elasticOutFn(0.1))
    assertInDelta(easeElasticOut(0.2), elasticOutFn(0.2))
    assertInDelta(easeElasticOut(0.3), elasticOutFn(0.3))
    assertInDelta(easeElasticOut(0.4), elasticOutFn(0.4))
    assertInDelta(easeElasticOut(0.5), elasticOutFn(0.5))
    assertInDelta(easeElasticOut(0.6), elasticOutFn(0.6))
    assertInDelta(easeElasticOut(0.7), elasticOutFn(0.7))
    assertInDelta(easeElasticOut(0.8), elasticOutFn(0.8))
    assertInDelta(easeElasticOut(0.9), elasticOutFn(0.9))
    expect(easeElasticOut(1.0)).toBe(elasticOutFn(1.0))
  })

  it('easeElasticOut.amplitude(a).period(p)(t) coerces t, a and p to numbers', () => {
    expect(easeElasticOut.amplitude(1.3 as any).period(0.2 as any)('.9' as any)).toBe(easeElasticOut.amplitude(1.3).period(0.2)(0.9))
    expect(easeElasticOut.amplitude({ valueOf() { return 1.3 } } as any).period({ valueOf() { return 0.2 } } as any)({ valueOf() { return 0.9 } } as any)).toBe(easeElasticOut.amplitude(1.3).period(0.2)(0.9))
  })

  it('easeElasticInOut(t) returns the expected results', () => {
    const elasticInOutFn = inOut(easeElasticIn)
    expect(easeElasticInOut(0.0)).toBe(elasticInOutFn(0.0))
    assertInDelta(easeElasticInOut(0.1), elasticInOutFn(0.1))
    assertInDelta(easeElasticInOut(0.2), elasticInOutFn(0.2))
    assertInDelta(easeElasticInOut(0.3), elasticInOutFn(0.3))
    assertInDelta(easeElasticInOut(0.4), elasticInOutFn(0.4))
    assertInDelta(easeElasticInOut(0.5), elasticInOutFn(0.5))
    assertInDelta(easeElasticInOut(0.6), elasticInOutFn(0.6))
    assertInDelta(easeElasticInOut(0.7), elasticInOutFn(0.7))
    assertInDelta(easeElasticInOut(0.8), elasticInOutFn(0.8))
    assertInDelta(easeElasticInOut(0.9), elasticInOutFn(0.9))
    expect(easeElasticInOut(1.0)).toBe(elasticInOutFn(1.0))
  })

  it('easeElasticInOut.amplitude(a).period(p)(t) coerces t, a and p to numbers', () => {
    expect(easeElasticInOut.amplitude(1.3 as any).period(0.2 as any)('.9' as any)).toBe(easeElasticInOut.amplitude(1.3).period(0.2)(0.9))
    expect(easeElasticInOut.amplitude({ valueOf() { return 1.3 } } as any).period({ valueOf() { return 0.2 } } as any)({ valueOf() { return 0.9 } } as any)).toBe(easeElasticInOut.amplitude(1.3).period(0.2)(0.9))
  })
})
