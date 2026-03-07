import { describe, expect, it } from 'bun:test'
import { mean, min, range } from '@ts-charts/array'
import { randomLcg, randomUniform } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomUniform', () => {
  it('randomUniform() returns random numbers with a mean of 0.5', () => {
    const r = randomUniform.source(randomLcg(0.5233099016390388))
    assertInDelta(mean(range(10000).map(r())) as number, 0.5, 0.05)
  })

  it('randomUniform() returns random numbers within the range [0,1)', () => {
    const r = randomUniform.source(randomLcg(0.6458793845385908))
    expect(min(range(10000).map(r()))!).toBeGreaterThanOrEqual(0)
    expect(min(range(10000).map(r()))!).toBeLessThan(1)
  })

  it('randomUniform(max) returns random numbers with a mean of max / 2', () => {
    const r = randomUniform.source(randomLcg(0.678948531603278))
    assertInDelta(mean(range(10000).map(r(42))) as number, 21, 0.5)
  })

  it('randomUniform(max) returns random numbers within the range [0,max)', () => {
    const r = randomUniform.source(randomLcg(0.48468185818988196))
    expect(min(range(10000).map(r(42)))!).toBeGreaterThanOrEqual(0)
    expect(min(range(10000).map(r(42)))!).toBeLessThan(42)
  })

  it('randomUniform(min, max) returns random numbers with a mean of (min + max) / 2', () => {
    const r = randomUniform.source(randomLcg(0.23751000425183233))
    assertInDelta(mean(range(10000).map(r(10, 42))) as number, 26, 0.5)
  })

  it('randomUniform(min, max) returns random numbers within the range [min,max)', () => {
    const r = randomUniform.source(randomLcg(0.3607454145271254))
    expect(min(range(10000).map(r(10, 42)))!).toBeGreaterThanOrEqual(10)
    expect(min(range(10000).map(r(10, 42)))!).toBeLessThan(42)
  })
})
