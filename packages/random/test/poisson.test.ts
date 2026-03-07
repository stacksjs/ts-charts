import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomLcg, randomPoisson } from '../src/index.ts'
import { skewness, kurtosis } from './statistics.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomPoisson', () => {
  it('randomPoisson(lambda) returns random numbers with a mean of lambda', () => {
    const r = randomPoisson.source(randomLcg(0.48758044703454373))
    assertInDelta(mean(range(100000).map(r(0.001))) as number, 0.001, 0.0005)
    assertInDelta(mean(range(10000).map(r(0.1))) as number, 0.1, 0.01)
    assertInDelta(mean(range(10000).map(r(0.5))) as number, 0.5, 0.05)
    assertInDelta(mean(range(10000).map(r(1))) as number, 1, 0.05)
    assertInDelta(mean(range(10000).map(r(2))) as number, 2, 0.1)
    assertInDelta(mean(range(10000).map(r(10))) as number, 10, 0.5)
    assertInDelta(mean(range(10000).map(r(1000))) as number, 1000, 20)
  })

  it('randomPoisson(lambda) returns random numbers with a variance of lambda', () => {
    const r = randomPoisson.source(randomLcg(0.4777559867161436))
    assertInDelta(variance(range(100000).map(r(0.001))) as number, 0.001, 0.0005)
    assertInDelta(variance(range(10000).map(r(0.1))) as number, 0.1, 0.01)
    assertInDelta(variance(range(10000).map(r(0.5))) as number, 0.5, 0.05)
    assertInDelta(variance(range(10000).map(r(1))) as number, 1, 0.05)
    assertInDelta(variance(range(10000).map(r(2))) as number, 2, 0.1)
    assertInDelta(variance(range(10000).map(r(10))) as number, 10, 0.5)
    assertInDelta(variance(range(10000).map(r(1000))) as number, 1000, 20)
  })

  it('randomPoisson(lambda) returns random numbers with a skewness of 1 / sqrt(lambda)', () => {
    const r = randomPoisson.source(randomLcg(0.09357670133206075))
    assertInDelta(skewness(range(100000).map(r(0.001))), 31.6, 5)
    assertInDelta(skewness(range(10000).map(r(0.1))), 3.16, 0.2)
    assertInDelta(skewness(range(10000).map(r(0.5))), 1.414, 0.1)
    assertInDelta(skewness(range(10000).map(r(1))), 1, 0.1)
    assertInDelta(skewness(range(10000).map(r(2))), 0.707, 0.05)
    assertInDelta(skewness(range(10000).map(r(10))), 0.316, 0.05)
    assertInDelta(skewness(range(10000).map(r(1000))), 0.0316, 0.05)
  })

  it('randomPoisson(lambda) returns random numbers with a kurtosis excess of 1 / lambda', () => {
    const r = randomPoisson.source(randomLcg(0.3299530136090847))
    assertInDelta(kurtosis(range(100000).map(r(0.001))), 1000, 200)
    assertInDelta(kurtosis(range(10000).map(r(0.1))), 10, 2)
    assertInDelta(kurtosis(range(10000).map(r(0.5))), 2, 0.5)
    assertInDelta(kurtosis(range(10000).map(r(1))), 1, 0.5)
    assertInDelta(kurtosis(range(10000).map(r(2))), 0.5, 0.2)
    assertInDelta(kurtosis(range(10000).map(r(10))), 0.1, 0.1)
    assertInDelta(kurtosis(range(10000).map(r(1000))), 0.001, 0.1)
  })
})
