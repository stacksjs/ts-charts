import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomGeometric, randomLcg } from '../src/index.ts'
import { skewness, kurtosis } from './statistics.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function dmean(p: number): number {
  return 1 / p
}

function dvariance(p: number): number {
  return (1 - p) / Math.pow(p, 2)
}

function skew(p: number): number {
  return (2 - p) / Math.sqrt(1 - p)
}

function kurt(p: number): number {
  return (Math.pow(p, 2) - 6 * p + 6) / (1 - p)
}

describe('randomGeometric', () => {
  it('randomGeometric(p) returns random geometrically distributed numbers with a mean of 1 / p.', () => {
    const r = randomGeometric.source(randomLcg(0.7687729138471455))
    assertInDelta(mean(range(10000).map(r(1))) as number, dmean(1), dvariance(1))
    assertInDelta(mean(range(10000).map(r(0.5))) as number, dmean(0.5), dvariance(0.5))
    assertInDelta(mean(range(10000).map(r(0.25))) as number, dmean(0.25), dvariance(0.25))
    assertInDelta(mean(range(10000).map(r(0.125))) as number, dmean(0.125), dvariance(0.125))
  })

  it('randomGeometric(p) returns random geometrically distributed numbers with a variance of (1 - p) / p^2.', () => {
    const r = randomGeometric.source(randomLcg(0.7194220774328326))
    assertInDelta(variance(range(10000).map(r(1))) as number, dvariance(1), dvariance(1) * 0.05)
    assertInDelta(variance(range(10000).map(r(0.5))) as number, dvariance(0.5), dvariance(0.5) * 0.05)
    assertInDelta(variance(range(10000).map(r(0.25))) as number, dvariance(0.25), dvariance(0.25) * 0.05)
    assertInDelta(variance(range(10000).map(r(0.125))) as number, dvariance(0.125), dvariance(0.125) * 0.05)
  })

  it('randomGeometric(p) returns random geometrically distributed numbers with a skewness of (2 - p) / sqrt(1 - p).', () => {
    const r = randomGeometric.source(randomLcg(0.016030992648006448))
    assertInDelta(skewness(range(10000).map(r(0.5))), skew(0.5), 0.05 * skew(0.5))
    assertInDelta(skewness(range(10000).map(r(0.25))), skew(0.25), 0.05 * skew(0.25))
    assertInDelta(skewness(range(10000).map(r(0.125))), skew(0.125), 0.1 * skew(0.125))
  })

  it('randomGeometric(p) returns random geometrically distributed numbers with a kurtosis excess of (p^2 - 6 * p + 6) / (1 - p).', () => {
    const r = randomGeometric.source(randomLcg(0.4039802168183795))
    assertInDelta(kurtosis(range(20000).map(r(0.5))), kurt(0.5), 0.2 * kurt(0.5))
    assertInDelta(kurtosis(range(20000).map(r(0.25))), kurt(0.25), 0.3 * kurt(0.25))
    assertInDelta(kurtosis(range(20000).map(r(0.125))), kurt(0.125), 0.3 * kurt(0.125))
  })
})
