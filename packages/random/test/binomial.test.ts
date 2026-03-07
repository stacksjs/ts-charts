import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomBinomial, randomLcg } from '../src/index.ts'
import { skewness, kurtosis } from './statistics.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  const diff = Math.abs(actual - expected)
  if (delta === 0) {
    expect(diff).toBe(0)
    return
  }

  expect(diff).toBeLessThan(delta)
}

function dmean(n: number, p: number): number {
  return n * p
}

function dvariance(n: number, p: number): number {
  return n * p * (1 - p)
}

function skew(n: number, p: number): number {
  return (1 - 2 * p) / Math.sqrt(dvariance(n, p))
}

function kurt(n: number, p: number): number {
  return (6 * Math.pow(p, 2) - 6 * p + 1) / (dvariance(n, p))
}

describe('randomBinomial', () => {
  it('randomBinomial(n, p) returns random binomial distributed numbers with a mean of n * p', () => {
    const r = randomBinomial.source(randomLcg(0.3994478770613372))
    assertInDelta(mean(range(10000).map(r(100, 1))) as number, dmean(100, 1), dvariance(100, 1))
    assertInDelta(mean(range(10000).map(r(100, 0.5))) as number, dmean(100, 0.5), dvariance(100, 0.5))
    assertInDelta(mean(range(10000).map(r(100, 0.25))) as number, dmean(100, 0.25), dvariance(100, 0.25))
    assertInDelta(mean(range(10000).map(r(100, 0))) as number, dmean(100, 0), dvariance(100, 0))
    assertInDelta(mean(range(10000).map(r(0, 0))) as number, dmean(0, 0), dvariance(0, 0))
  })

  it('randomBinomial(n, p) returns random binomial distributed numbers with a variance of n * p * (1 - p)', () => {
    const r = randomBinomial.source(randomLcg(0.7214876234380256))
    assertInDelta(variance(range(10000).map(r(100, 1))) as number, dvariance(100, 1), 0)
    assertInDelta(variance(range(10000).map(r(100, 0.5))) as number, dvariance(100, 0.5), 0.5)
    assertInDelta(variance(range(10000).map(r(100, 0.25))) as number, dvariance(100, 0.25), 1)
    assertInDelta(variance(range(10000).map(r(100, 0))) as number, dvariance(100, 0), 0)
    assertInDelta(variance(range(10000).map(r(0, 0))) as number, dvariance(0, 0), 0)
  })

  it('randomBinomial(n, p) returns random binomial distributed numbers with a skewness of (1 - 2 * p) / sqrt(n * p * (1 - p))', () => {
    const r = randomBinomial.source(randomLcg(0.0646181509291679))
    assertInDelta(skewness(range(10000).map(r(100, 0.05))), skew(100, 0.05), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.10))), skew(100, 0.10), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.15))), skew(100, 0.15), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.20))), skew(100, 0.20), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.25))), skew(100, 0.25), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.30))), skew(100, 0.30), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.35))), skew(100, 0.35), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.40))), skew(100, 0.40), 0.05)
    assertInDelta(skewness(range(10000).map(r(100, 0.45))), skew(100, 0.45), 0.05)
  })

  it('randomBinomial(n, p) returns random binomial distributed numbers with a kurtosis excess of (6 * p^2 - 6 * p - 1) / (n * p * (1 - p))', () => {
    const r = randomBinomial.source(randomLcg(0.6451552018202751))
    assertInDelta(kurtosis(range(10000).map(r(100, 0.05))), kurt(100, 0.05), 0.2)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.10))), kurt(100, 0.10), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.15))), kurt(100, 0.15), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.20))), kurt(100, 0.20), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.25))), kurt(100, 0.25), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.30))), kurt(100, 0.30), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.35))), kurt(100, 0.35), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.40))), kurt(100, 0.40), 0.1)
    assertInDelta(kurtosis(range(10000).map(r(100, 0.45))), kurt(100, 0.45), 0.05)
  })
})
