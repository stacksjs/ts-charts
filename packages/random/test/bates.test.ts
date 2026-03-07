import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomBates, randomLcg } from '../src/index.ts'
import { skewness, kurtosis } from './statistics.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomBates', () => {
  it('randomBates(n) returns random numbers with a mean of one-half', () => {
    const r = randomBates.source(randomLcg(0.6351090615932817))
    assertInDelta(mean(range(10000).map(r(1))) as number, 0.5, 0.05)
    assertInDelta(mean(range(10000).map(r(10))) as number, 0.5, 0.05)
    assertInDelta(mean(range(10000).map(r(1.5))) as number, 0.5, 0.05)
    assertInDelta(mean(range(10000).map(r(4.2))) as number, 0.5, 0.05)
  })

  it('randomBates(n) returns random numbers with a variance of 1 / (12 * n)', () => {
    const r = randomBates.source(randomLcg(0.1284832084868286))
    assertInDelta(variance(range(10000).map(r(1))) as number, 1 / 12, 0.05)
    assertInDelta(variance(range(10000).map(r(10))) as number, 1 / 120, 0.05)
    assertInDelta(variance(range(10000).map(r(1.5))) as number, 1 / 18, 0.05)
    assertInDelta(variance(range(10000).map(r(4.2))) as number, 1 / 50.4, 0.05)
  })

  it('randomBates(n) returns random numbers with a skewness of 0', () => {
    const r = randomBates.source(randomLcg(0.051567609139606674))
    assertInDelta(skewness(range(10000).map(r(1))), 0, 0.05)
    assertInDelta(skewness(range(10000).map(r(10))), 0, 0.05)
    assertInDelta(skewness(range(10000).map(r(1.5))), 0, 0.05)
    assertInDelta(skewness(range(10000).map(r(4.2))), 0, 0.05)
  })

  it('randomBates(n) returns random numbers with a kurtosis of -6 / (5 * n)', () => {
    const r = randomBates.source(randomLcg(0.696913354780724))
    assertInDelta(kurtosis(range(10000).map(r(1))), -6 / 5, 0.05)
    assertInDelta(kurtosis(range(10000).map(r(10))), -6 / 50, 0.1)
    assertInDelta(kurtosis(range(10000).map(r(1.5))), -6 / 7.5, 0.05)
    assertInDelta(kurtosis(range(10000).map(r(4.2))), -6 / 21, 0.05)
  })

  it('randomBates(0) is equivalent to randomUniform()', () => {
    const r = randomBates.source(randomLcg(0.7717596603725383))
    assertInDelta(mean(range(10000).map(r(0))) as number, 0.5, 0.05)
    assertInDelta(variance(range(10000).map(r(0))) as number, 1 / 12, 0.05)
    assertInDelta(skewness(range(10000).map(r(0))), 0, 0.05)
    assertInDelta(kurtosis(range(10000).map(r(0))), -6 / 5, 0.05)
  })
})
