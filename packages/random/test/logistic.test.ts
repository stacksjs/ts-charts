import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomLcg, randomLogistic } from '../src/index.ts'
import { skewness, kurtosis } from './statistics.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function dvariance(_a: number, b: number): number {
  return Math.pow(Math.PI * b, 2) / 3
}

describe('randomLogistic', () => {
  it('randomLogistic(a, b) returns random numbers with a mean of a', () => {
    const r = randomLogistic.source(randomLcg(0.8792712826844997))
    assertInDelta(mean(range(10000).map(r())) as number, 0, 0.05)
    assertInDelta(mean(range(10000).map(r(5))) as number, 5, 0.05)
    assertInDelta(mean(range(10000).map(r(0, 4))) as number, 0, 0.1)
    assertInDelta(mean(range(10000).map(r(1, 3))) as number, 1, 0.1)
    assertInDelta(mean(range(10000).map(r(3, 1))) as number, 3, 0.05)
  })

  it('randomLogistic(a, b) returns random numbers with a variance of (b * pi)^2 / 3', () => {
    const r = randomLogistic.source(randomLcg(0.5768515852192524))
    assertInDelta(variance(range(10000).map(r())) as number, dvariance(0, 1), 0.2)
    assertInDelta(variance(range(10000).map(r(5))) as number, dvariance(5, 1), 0.2)
    assertInDelta(variance(range(10000).map(r(0, 4))) as number, dvariance(0, 4), 2)
    assertInDelta(variance(range(10000).map(r(1, 3))) as number, dvariance(1, 3), 2)
    assertInDelta(variance(range(10000).map(r(3, 1))) as number, dvariance(3, 1), 2)
  })

  it('randomLogistic(a, b) returns random numbers with a skewness of zero', () => {
    const r = randomLogistic.source(randomLcg(0.8835033777589203))
    assertInDelta(skewness(range(10000).map(r())), 0, 0.1)
    assertInDelta(skewness(range(10000).map(r(5))), 0, 0.1)
    assertInDelta(skewness(range(10000).map(r(0, 4))), 0, 0.1)
    assertInDelta(skewness(range(10000).map(r(1, 3))), 0, 0.1)
    assertInDelta(skewness(range(10000).map(r(3, 1))), 0, 0.1)
  })

  it('randomLogistic(a, b) returns random numbers with an excess kurtosis of 1.2', () => {
    const r = randomLogistic.source(randomLcg(0.8738996292947383))
    assertInDelta(kurtosis(range(10000).map(r())), 1.2, 0.6)
    assertInDelta(kurtosis(range(10000).map(r(5))), 1.2, 0.6)
    assertInDelta(kurtosis(range(10000).map(r(0, 4))), 1.2, 0.6)
    assertInDelta(kurtosis(range(10000).map(r(1, 3))), 1.2, 0.6)
    assertInDelta(kurtosis(range(10000).map(r(3, 1))), 1.2, 0.6)
  })
})
